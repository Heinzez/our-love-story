import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "";

// ── Rate limiting (per IP, in-memory) ─────────────────────────
const rateBuckets = new Map<string, number[]>();
function rateLimit(ip: string, limit = 12, windowMs = 60_000): boolean {
  const now = Date.now();
  const arr = (rateBuckets.get(ip) || []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) { rateBuckets.set(ip, arr); return false; }
  arr.push(now); rateBuckets.set(ip, arr); return true;
}

// ── Heartfelt auto-replies when admin offline ─────────────────
const AUTO_REPLIES = [
  "I'm not at my phone right now, my love — but I read every word you send. 💕",
  "Even when I'm silent, I'm thinking of you. I'll be back soon. ❤️",
  "Hey beautiful — I saw this. I just can't reply this second. Hold tight, I'm coming. 🌹",
  "Your message just lit up my world. Give me a moment and I'll be right here. ✨",
  "I'm tied up for a sec, but you have my whole heart. Always. 💍",
  "Reading this with the biggest smile. I'll write back the moment I can. 💕",
  "You being here means everything. I'm on my way back to you. 🤍",
  "Don't ever doubt how loved you are — I'll reply properly very soon. ❤️",
  "I hear you, queen. I'm just a moment away. 💌",
  "Your voice (even in text) is my favourite sound. I'll be right with you. ✨",
];
let lastAutoReplyIdx = -1;
function pickAutoReply(): string {
  let i = Math.floor(Math.random() * AUTO_REPLIES.length);
  if (i === lastAutoReplyIdx) i = (i + 1) % AUTO_REPLIES.length;
  lastAutoReplyIdx = i;
  return AUTO_REPLIES[i];
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function verifyAdmin(token: string | null): Promise<boolean> {
  if (!token) return false;
  const { data } = await supabase.from("admin_sessions").select("expires_at").eq("token", token).maybeSingle();
  if (!data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}

async function sendTelegram(text: string): Promise<number | null> {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML" }),
    });
    const d = await r.json();
    return d?.result?.message_id ?? null;
  } catch (_) { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const action = (body as Record<string, unknown>).action as string;

    if (action === "list") {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, text, sender, status, date, is_ai, page_key, created_at, media_url, media_type")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // mark "sent" from her as delivered
      await supabase.from("chat_messages").update({ status: "delivered" }).eq("sender", "her").eq("status", "sent");
      const mapped = (data ?? []).map((m: Record<string, unknown>) => ({ ...m, isAi: m.is_ai, createdAt: m.created_at, mediaUrl: m.media_url, mediaType: m.media_type }));
      return json(mapped);
    }

    if (action === "send") {
      const ip = req.headers.get("x-forwarded-for") || "anon";
      if (!rateLimit(ip)) return json({ error: "Slow down a little 💕 try again in a minute." }, 429);
      const text = String((body as Record<string, unknown>).text || "").trim();
      if (!text) return json({ error: "text required" }, 400);
      if (text.length > 2000) return json({ error: "too long" }, 400);
      const pageKey = String((body as Record<string, unknown>).pageKey || "landing");
      const tgId = await sendTelegram(`💌 <b>She said${pageKey !== "landing" ? ` (${pageKey})` : ""}:</b>\n"${text}"\n\n<i>Reply with: /reply your message</i>`);
      const { data, error } = await supabase.from("chat_messages").insert({
        text, sender: "her", status: "sent", date: todayStr(), is_ai: false, page_key: pageKey, telegram_message_id: tgId,
      }).select().single();
      if (error) throw error;
      // Auto-reply if admin appears offline (no admin reply in last 10 min)
      try {
        const tenMinAgo = new Date(Date.now() - 10 * 60_000).toISOString();
        const { count } = await supabase.from("chat_messages")
          .select("id", { count: "exact", head: true })
          .eq("sender", "me").eq("is_ai", false)
          .gte("created_at", tenMinAgo);
        if ((count ?? 0) === 0) {
          await supabase.from("chat_messages").insert({
            text: pickAutoReply(), sender: "me", status: "delivered", date: todayStr(),
            is_ai: true, page_key: pageKey,
          });
        }
      } catch (_) { /* non-fatal */ }
      return json(data);
    }

    if (action === "send-media") {
      const ip = req.headers.get("x-forwarded-for") || "anon";
      if (!rateLimit(ip, 6, 60_000)) return json({ error: "Slow down a little 💕" }, 429);
      const fileBase64 = String((body as Record<string, unknown>).fileBase64 || "");
      const fileName = String((body as Record<string, unknown>).fileName || "media");
      const kind = String((body as Record<string, unknown>).kind || "image"); // image | video | audio
      const text = String((body as Record<string, unknown>).text || "");
      if (!fileBase64) return json({ error: "missing file" }, 400);
      const ext = (fileName.split(".").pop() || "bin").toLowerCase();
      // size caps: image 6MB, audio 10MB, video 40MB (base64 ~4/3)
      const cap = kind === "video" ? 56_000_000 : kind === "audio" ? 14_000_000 : 8_500_000;
      if (fileBase64.length > cap) return json({ error: "file too large" }, 400);
      const path = `chat/${crypto.randomUUID()}.${ext}`;
      const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
      const ct = kind === "video" ? `video/${ext === "mov" ? "quicktime" : ext}`
        : kind === "audio" ? (ext === "webm" ? "audio/webm" : `audio/${ext}`)
        : `image/${ext === "jpg" ? "jpeg" : ext}`;
      const { error: upErr } = await supabase.storage.from("premiere-media").upload(path, bytes, { contentType: ct, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("premiere-media").getPublicUrl(path);
      const pageKey = String((body as Record<string, unknown>).pageKey || "landing");
      const sender = (body as Record<string, unknown>).sender === "me" ? "me" : "her";
      const { data, error } = await supabase.from("chat_messages").insert({
        text: text || (kind === "audio" ? "🎙️ voice note" : kind === "video" ? "🎬 video" : "📷 photo"),
        sender, status: "sent", date: todayStr(), is_ai: false, page_key: pageKey,
        media_url: pub.publicUrl, media_path: path, media_type: kind,
      }).select().single();
      if (error) throw error;
      if (sender === "her") {
        await sendTelegram(`💌 <b>She sent ${kind}:</b> ${pub.publicUrl}`);
      }
      return json(data);
    }

    if (action === "reply") {
      const token = req.headers.get("x-admin-token");
      const ok = await verifyAdmin(token);
      if (!ok) return json({ error: "Unauthorized" }, 401);
      const text = String((body as Record<string, unknown>).text || "").trim();
      if (!text) return json({ error: "text required" }, 400);
      if (text.length > 2000) return json({ error: "too long" }, 400);
      await supabase.from("chat_messages").update({ status: "seen" }).eq("sender", "her");
      const { data, error } = await supabase.from("chat_messages").insert({
        text, sender: "me", status: "delivered", date: todayStr(), is_ai: false, page_key: "landing",
      }).select().single();
      if (error) throw error;
      // mirror to Telegram
      await sendTelegram(`✅ Reply sent: "${text}"`);
      return json(data);
    }

    if (action === "seen") {
      const markSender = (body as Record<string, unknown>).markSender === "me" ? "me" : "her";
      await supabase.from("chat_messages").update({ status: "seen" }).eq("sender", markSender);
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
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
        .select("id, text, sender, status, date, is_ai, page_key, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      // mark "sent" from her as delivered
      await supabase.from("chat_messages").update({ status: "delivered" }).eq("sender", "her").eq("status", "sent");
      const mapped = (data ?? []).map((m: Record<string, unknown>) => ({ ...m, isAi: m.is_ai, createdAt: m.created_at }));
      return json(mapped);
    }

    if (action === "send") {
      const text = String((body as Record<string, unknown>).text || "").trim();
      if (!text) return json({ error: "text required" }, 400);
      if (text.length > 2000) return json({ error: "too long" }, 400);
      const pageKey = String((body as Record<string, unknown>).pageKey || "landing");
      const tgId = await sendTelegram(`💌 <b>She said${pageKey !== "landing" ? ` (${pageKey})` : ""}:</b>\n"${text}"\n\n<i>Reply with: /reply your message</i>`);
      const { data, error } = await supabase.from("chat_messages").insert({
        text, sender: "her", status: "sent", date: todayStr(), is_ai: false, page_key: pageKey, telegram_message_id: tgId,
      }).select().single();
      if (error) throw error;
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
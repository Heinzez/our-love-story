import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const TELEGRAM_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") || "";
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID") || "";

function todayStr() { return new Date().toISOString().slice(0, 10); }

// In-memory dedup cache (5 min) to absorb retry storms
const seenUpdates = new Map<number, number>();
function alreadySeen(id: number): boolean {
  const now = Date.now();
  for (const [k, t] of seenUpdates) if (now - t > 5 * 60_000) seenUpdates.delete(k);
  if (seenUpdates.has(id)) return true;
  seenUpdates.set(id, now);
  return false;
}

async function sendTelegram(text: string) {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML" }),
    });
  } catch (_) {}
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  try {
    const update = await req.json();
    const message = update?.message ?? update?.edited_message;
    const updateId = update?.update_id;
    if (!message || typeof updateId !== "number") return new Response(JSON.stringify({ ok: true }));
    if (alreadySeen(updateId)) return new Response(JSON.stringify({ ok: true, dedup: true }));

    const fromChatId = message?.chat?.id;
    // Persist for admin visibility (idempotent on update_id)
    await supabase.from("telegram_updates").upsert({
      update_id: updateId,
      chat_id: fromChatId ?? null,
      message_id: message?.message_id ?? null,
      page_key: "landing",
      text: message?.text ?? null,
      raw_update: update,
    }, { onConflict: "update_id" });

    // Only process commands from registered admin chat
    if (!TELEGRAM_CHAT_ID || String(fromChatId) !== TELEGRAM_CHAT_ID) {
      return new Response(JSON.stringify({ ok: true }));
    }

    const text: string = (message?.text || "").trim();
    if (!text) return new Response(JSON.stringify({ ok: true }));

    if (text.toLowerCase().startsWith("/reply ")) {
      const replyText = text.slice(7).trim();
      if (replyText) {
        await supabase.from("chat_messages").update({ status: "seen" }).eq("sender", "her");
        await supabase.from("chat_messages").insert({
          text: replyText, sender: "me", status: "delivered", date: todayStr(), is_ai: false, page_key: "landing",
        });
        await sendTelegram(`✅ Reply sent: "${replyText}"`);
      }
    } else if (text === "/help" || text === "/start") {
      await sendTelegram(
        `💌 <b>IlyNimo Bot</b>\n\n/reply &lt;message&gt; — Send a reply to her\n/help — Show this`
      );
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: e instanceof Error ? e.message : "err" }), { status: 200 });
  }
});
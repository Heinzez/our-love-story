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
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

function json(o: unknown, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function verifyAdmin(token: string | null): Promise<boolean> {
  if (!token) return false;
  const { data } = await supabase.from("admin_sessions").select("expires_at").eq("token", token).maybeSingle();
  if (!data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}

function webhookUrl(): string {
  // Always point Telegram at our edge function
  return `${SUPABASE_URL}/functions/v1/telegram-webhook`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const ok = await verifyAdmin(req.headers.get("x-admin-token"));
    if (!ok) return json({ error: "Unauthorized" }, 401);
    if (!TELEGRAM_TOKEN) return json({ error: "TELEGRAM_BOT_TOKEN not configured" }, 400);

    const body = await req.json().catch(() => ({}));
    const action = (body as Record<string, unknown>).action as string;

    if (action === "status") {
      const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getWebhookInfo`);
      const info = await r.json();
      const { data: lastUpdate } = await supabase
        .from("telegram_updates").select("*").order("received_at", { ascending: false }).limit(1).maybeSingle();
      await supabase.from("telegram_webhook_status").upsert({
        id: "singleton",
        webhook_url: info?.result?.url || null,
        is_registered: !!info?.result?.url,
        last_checked_at: new Date().toISOString(),
        info: info?.result || null,
        updated_at: new Date().toISOString(),
      });
      return json({ ok: true, info: info?.result, expectedUrl: webhookUrl(), lastUpdate });
    }

    if (action === "register") {
      const url = webhookUrl();
      const r = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, allowed_updates: ["message", "edited_message"] }),
      });
      const data = await r.json();
      await supabase.from("telegram_webhook_status").upsert({
        id: "singleton",
        webhook_url: url,
        is_registered: !!data?.ok,
        last_registered_at: new Date().toISOString(),
        last_error: data?.ok ? null : (data?.description || "register failed"),
        updated_at: new Date().toISOString(),
      });
      return json({ ok: !!data?.ok, result: data, url });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});
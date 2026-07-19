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

function json(o: unknown, s = 200) {
  return new Response(JSON.stringify(o), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function verifyAdmin(token: string | null) {
  if (!token) return false;
  const { data } = await supabase.from("admin_sessions").select("expires_at").eq("token", token).maybeSingle();
  return !!data && new Date(data.expires_at).getTime() > Date.now();
}

type Step = { name: string; ok: boolean; ms: number; detail?: string };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const token = req.headers.get("x-admin-token");
  if (!(await verifyAdmin(token))) return json({ error: "Unauthorized" }, 401);

  const steps: Step[] = [];
  const run = async (name: string, fn: () => Promise<string | void>) => {
    const t = Date.now();
    try { const d = await fn(); steps.push({ name, ok: true, ms: Date.now() - t, detail: d || "ok" }); }
    catch (e) { steps.push({ name, ok: false, ms: Date.now() - t, detail: (e as Error).message }); }
  };

  let testMsgId: string | null = null;
  let testPath: string | null = null;

  await run("Chat send (as her)", async () => {
    const { data, error } = await supabase.from("chat_messages").insert({
      text: "🔧 self-test — she sent", sender: "her", status: "sent",
      date: new Date().toISOString().slice(0, 10), is_ai: false, page_key: "landing",
    }).select().single();
    if (error) throw error;
    testMsgId = data.id;
    return `id=${data.id}`;
  });

  await run("Chat reply (as admin)", async () => {
    const { error } = await supabase.from("chat_messages").insert({
      text: "🔧 self-test — admin reply", sender: "me", status: "delivered",
      date: new Date().toISOString().slice(0, 10), is_ai: false, page_key: "landing",
    });
    if (error) throw error;
  });

  await run("Media upload (1KB image)", async () => {
    const bytes = new Uint8Array(1024);
    const p = `selftest/${crypto.randomUUID()}.bin`;
    testPath = p;
    const { error } = await supabase.storage.from("premiere-media").upload(p, bytes, { contentType: "application/octet-stream", upsert: false });
    if (error) throw error;
    const { data: pub } = supabase.storage.from("premiere-media").getPublicUrl(p);
    return pub.publicUrl;
  });

  await run("Admin preview (page_settings read)", async () => {
    const { data, error } = await supabase.from("page_settings").select("page_key, premiere_date").limit(6);
    if (error) throw error;
    return `${(data ?? []).length} pages`;
  });

  await run("Telegram webhook status", async () => {
    const { data } = await supabase.from("telegram_webhook_status").select("last_ok_at, last_error").order("id", { ascending: false }).limit(1);
    if (!data || !data.length) return "no status recorded yet";
    const r = data[0] as { last_ok_at?: string; last_error?: string };
    return r.last_error ? `error: ${r.last_error}` : `ok at ${r.last_ok_at || "?"}`;
  });

  // Cleanup — best-effort
  try {
    await supabase.from("chat_messages").delete().like("text", "🔧 self-test%");
    if (testPath) await supabase.storage.from("premiere-media").remove([testPath]);
  } catch (_) { /* ignore */ }

  const ok = steps.every((s) => s.ok);
  return json({ ok, steps, ranAt: new Date().toISOString() });
});
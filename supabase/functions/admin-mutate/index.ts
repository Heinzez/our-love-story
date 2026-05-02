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

const PAGE_KEYS = new Set(["our-story", "the-journey", "laughs", "letters", "goals"]);

async function verifyAdmin(token: string | null): Promise<boolean> {
  if (!token) return false;
  const { data, error } = await supabase
    .from("admin_sessions")
    .select("expires_at")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return false;
  return new Date(data.expires_at).getTime() > Date.now();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = req.headers.get("x-admin-token");
    const ok = await verifyAdmin(token);
    if (!ok) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const action = body?.action as string;

    if (action === "update-page") {
      const { pageKey, premiereDate, description } = body;
      if (!PAGE_KEYS.has(pageKey)) return json({ error: "Invalid page" }, 400);
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (premiereDate !== undefined) update.premiere_date = premiereDate;
      if (description !== undefined) update.description = String(description).slice(0, 500);
      const { error } = await supabase.from("page_settings").update(update).eq("page_key", pageKey);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "upload-image") {
      const { pageKey, fileName, fileBase64, caption } = body;
      if (!PAGE_KEYS.has(pageKey)) return json({ error: "Invalid page" }, 400);
      if (typeof fileBase64 !== "string" || !fileName) return json({ error: "Missing file" }, 400);
      // size guard ~ 6MB base64
      if (fileBase64.length > 8_500_000) return json({ error: "File too large (max 6MB)" }, 400);
      const ext = String(fileName).split(".").pop()?.toLowerCase() || "jpg";
      if (!["jpg","jpeg","png","webp","gif"].includes(ext)) return json({ error: "Invalid file type" }, 400);
      const path = `${pageKey}/${crypto.randomUUID()}.${ext}`;
      const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
      const { error: upErr } = await supabase.storage.from("premiere-media").upload(path, bytes, {
        contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("page_images").insert({
        page_key: pageKey, image_path: path, caption: caption ? String(caption).slice(0, 200) : null,
      });
      if (insErr) throw insErr;
      const { data: pub } = supabase.storage.from("premiere-media").getPublicUrl(path);
      return json({ ok: true, url: pub.publicUrl, path });
    }

    if (action === "delete-image") {
      const { id, path } = body;
      if (!id || !path) return json({ error: "Missing id/path" }, 400);
      await supabase.storage.from("premiere-media").remove([String(path)]);
      const { error } = await supabase.from("page_images").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }

    return json({ error: "Unknown action" }, 400);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

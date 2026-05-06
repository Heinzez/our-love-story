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

const PAGE_KEYS = new Set(["landing", "our-story", "the-journey", "laughs", "letters", "goals"]);

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
    const body = await req.json();
    const action = body?.action as string;

    // Public action: anyone can upload to the "landing" gallery.
    // All other actions (delete/update/reorder/page settings/notify) require admin token.
    const isPublicLandingUpload =
      action === "upload-image" && body?.pageKey === "landing";

    const isPublicGetSettings = action === "get-settings";

    if (!isPublicLandingUpload && !isPublicGetSettings) {
      const ok = await verifyAdmin(token);
      if (!ok) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    if (action === "get-settings") {
      const { data } = await supabase.from("site_settings").select("key, value");
      const map: Record<string, string> = {};
      for (const r of (data ?? []) as { key: string; value: string }[]) map[r.key] = r.value;
      return json({
        giftLocked: (map["gift_locked"] ?? "false") === "true",
        weeklyGiftAmount: parseInt(map["weekly_gift_amount"] ?? "500", 10),
      });
    }

    if (action === "set-setting") {
      const { key, value } = body as { key?: string; value?: string };
      const allowed = new Set(["gift_locked", "weekly_gift_amount"]);
      if (!key || !allowed.has(key) || typeof value !== "string") return json({ error: "Invalid setting" }, 400);
      const { error } = await supabase.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() });
      if (error) throw error;
      return json({ ok: true });
    }

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
      const { pageKey, fileName, fileBase64, caption, mediaType } = body;
      if (!PAGE_KEYS.has(pageKey)) return json({ error: "Invalid page" }, 400);
      if (typeof fileBase64 !== "string" || !fileName) return json({ error: "Missing file" }, 400);
      const ext = String(fileName).split(".").pop()?.toLowerCase() || "jpg";
      const isVideo = mediaType === "video" || ["mp4","webm","mov","m4v"].includes(ext);
      const allowedImg = ["jpg","jpeg","png","webp","gif"];
      const allowedVid = ["mp4","webm","mov","m4v"];
      if (isVideo && !allowedVid.includes(ext)) return json({ error: "Invalid video type" }, 400);
      if (!isVideo && !allowedImg.includes(ext)) return json({ error: "Invalid file type" }, 400);
      // base64 length ≈ 4/3 * bytes. Image cap 6MB, video cap 40MB.
      const maxB64 = isVideo ? 56_000_000 : 8_500_000;
      if (fileBase64.length > maxB64) return json({ error: isVideo ? "Video too large (max 40MB)" : "Image too large (max 6MB)" }, 400);
      const path = `${pageKey}/${crypto.randomUUID()}.${ext}`;
      const bytes = Uint8Array.from(atob(fileBase64), (c) => c.charCodeAt(0));
      const contentType = isVideo
        ? (ext === "mov" ? "video/quicktime" : `video/${ext}`)
        : `image/${ext === "jpg" ? "jpeg" : ext}`;
      const { error: upErr } = await supabase.storage.from("premiere-media").upload(path, bytes, {
        contentType, upsert: false,
      });
      if (upErr) throw upErr;
      const { error: insErr } = await supabase.from("page_images").insert({
        page_key: pageKey, image_path: path, caption: caption ? String(caption).slice(0, 200) : null,
        media_type: isVideo ? "video" : "image",
      });
      if (insErr) throw insErr;
      const { data: pub } = supabase.storage.from("premiere-media").getPublicUrl(path);
      return json({ ok: true, url: pub.publicUrl, path, mediaType: isVideo ? "video" : "image" });
    }

    if (action === "delete-image") {
      const { id, path } = body;
      if (!id || !path) return json({ error: "Missing id/path" }, 400);
      // Verify image actually belongs to a valid page (extra integrity check)
      const { data: existing } = await supabase.from("page_images").select("page_key, image_path").eq("id", id).maybeSingle();
      if (!existing || existing.image_path !== path || !PAGE_KEYS.has(existing.page_key)) {
        return json({ error: "Image not found or page key mismatch" }, 400);
      }
      await supabase.storage.from("premiere-media").remove([String(path)]);
      const { error } = await supabase.from("page_images").delete().eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "update-image") {
      const { id, caption, sort_order } = body;
      if (!id) return json({ error: "Missing id" }, 400);
      const update: Record<string, unknown> = {};
      if (caption !== undefined) update.caption = caption ? String(caption).slice(0, 200) : null;
      if (typeof sort_order === "number") update.sort_order = sort_order;
      if (!Object.keys(update).length) return json({ error: "Nothing to update" }, 400);
      const { error } = await supabase.from("page_images").update(update).eq("id", id);
      if (error) throw error;
      return json({ ok: true });
    }

    if (action === "reorder-images") {
      const { pageKey, orderedIds } = body;
      if (!PAGE_KEYS.has(pageKey) || !Array.isArray(orderedIds)) return json({ error: "Invalid input" }, 400);
      for (let i = 0; i < orderedIds.length; i++) {
        await supabase.from("page_images").update({ sort_order: i }).eq("id", orderedIds[i]).eq("page_key", pageKey);
      }
      return json({ ok: true });
    }

    if (action === "notify-premiere") {
      const { pageKey } = body;
      if (!PAGE_KEYS.has(pageKey)) return json({ error: "Invalid page" }, 400);
      const { data: subs } = await supabase.from("email_subscribers").select("primary_email, backup_email");
      const emails = (subs ?? []).flatMap((s: { primary_email: string; backup_email: string | null }) =>
        [s.primary_email, s.backup_email].filter(Boolean)
      );
      // Mark page as live now (set premiere_date = now if in the future)
      await supabase.from("page_settings").update({ premiere_date: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("page_key", pageKey);
      return json({ ok: true, notified: emails.length, recipients: emails });
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

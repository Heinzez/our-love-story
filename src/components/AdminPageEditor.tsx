import { useState } from "react";
import { useSite } from "@/context/SiteContext";
import { supabase } from "@/integrations/supabase/client";
import { Image as ImageIcon, Calendar, Loader2, Trash2, Upload, Check } from "lucide-react";

const PAGES: { key: string; label: string; emoji: string }[] = [
  { key: "our-story", label: "Our Story", emoji: "📖" },
  { key: "the-journey", label: "The Journey", emoji: "🗺️" },
  { key: "laughs", label: "Laughs", emoji: "😂" },
  { key: "letters", label: "Letters", emoji: "💌" },
  { key: "goals", label: "Goals & Dreams", emoji: "⭐" },
];

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const res = String(r.result || "");
      resolve(res.split(",")[1] || "");
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const AdminPageEditor = () => {
  const { adminToken, pageSettings, pageImages, refreshPageData } = useSite();
  const [active, setActive] = useState(PAGES[0].key);
  const [dateInput, setDateInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const setting = pageSettings[active];
  const images = pageImages[active] ?? [];

  const call = async (body: Record<string, unknown>) => {
    if (!adminToken) throw new Error("Not authenticated as admin. Sign in again.");
    const { data, error } = await supabase.functions.invoke("admin-mutate", {
      body,
      headers: { "x-admin-token": adminToken },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const saveSettings = async () => {
    setBusy(true); setErr(null); setMsg(null);
    try {
      await call({
        action: "update-page",
        pageKey: active,
        premiereDate: dateInput ? new Date(dateInput).toISOString() : undefined,
        description: descInput || undefined,
      });
      setMsg("Page updated.");
      setDateInput(""); setDescInput("");
      await refreshPageData();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const upload = async (file: File) => {
    setBusy(true); setErr(null); setMsg(null);
    try {
      if (file.size > 6 * 1024 * 1024) throw new Error("Max 6MB per image.");
      const base64 = await fileToBase64(file);
      await call({
        action: "upload-image",
        pageKey: active,
        fileName: file.name,
        fileBase64: base64,
        caption: caption || undefined,
      });
      setMsg("Image uploaded.");
      setCaption("");
      await refreshPageData();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string, path: string) => {
    if (!confirm("Delete this image?")) return;
    setBusy(true); setErr(null); setMsg(null);
    try {
      await call({ action: "delete-image", id, path });
      setMsg("Image deleted.");
      await refreshPageData();
    } catch (e) { setErr((e as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl p-6" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.15)" }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(338 80% 62% / 0.12)" }}>
          <ImageIcon className="w-4 h-4 text-primary" />
        </div>
        <h3 className="font-display text-base text-foreground tracking-wide">Page Editor</h3>
      </div>

      {!adminToken && (
        <p className="text-amber-400/80 text-sm mb-4">Admin session token missing. Sign out and sign back in to enable editing.</p>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {PAGES.map((p) => (
          <button
            key={p.key}
            onClick={() => { setActive(p.key); setDateInput(""); setDescInput(""); setMsg(null); setErr(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-display tracking-wide transition-all ${
              active === p.key ? "text-primary-foreground" : "text-muted-foreground"
            }`}
            style={active === p.key
              ? { background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }
              : { background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(338 80% 62% / 0.15)" }}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {/* Settings */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-body">
            <Calendar className="w-3 h-3 inline mr-1" />
            Premiere Date {setting?.premiere_date && <span className="opacity-50">(current: {new Date(setting.premiere_date).toLocaleDateString()})</span>}
          </label>
          <input
            type="datetime-local"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full bg-muted/20 border border-border/30 rounded-xl px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary/40"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5 font-body">
            Description {setting?.description && <span className="opacity-50 italic">— "{setting.description.slice(0, 60)}{(setting.description.length > 60) ? "…" : ""}"</span>}
          </label>
          <textarea
            value={descInput}
            onChange={(e) => setDescInput(e.target.value)}
            rows={2}
            placeholder="Override the description shown on the locked page"
            maxLength={500}
            className="w-full bg-muted/20 border border-border/30 rounded-xl px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary/40"
          />
        </div>
        <button
          onClick={saveSettings}
          disabled={busy || (!dateInput && !descInput)}
          className="px-4 py-2 rounded-xl font-display text-sm tracking-wide text-primary-foreground transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "Save Page Settings"}
        </button>
      </div>

      {/* Upload */}
      <div className="border-t border-border/20 pt-5 mb-6">
        <label className="block text-xs text-muted-foreground mb-1.5 font-body">Caption (optional)</label>
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={200}
          placeholder="A few words about this image"
          className="w-full bg-muted/20 border border-border/30 rounded-xl px-3 py-2 text-foreground font-body text-sm focus:outline-none focus:border-primary/40 mb-3"
        />
        <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-primary/30 text-muted-foreground hover:text-foreground hover:border-primary/60 cursor-pointer transition-all">
          <Upload className="w-4 h-4" />
          <span className="font-body text-sm">{busy ? "Uploading…" : "Upload an image (max 6MB)"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={busy}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }}
            className="hidden"
          />
        </label>
      </div>

      {msg && <div className="flex items-center gap-2 text-primary text-sm mb-3"><Check className="w-4 h-4" />{msg}</div>}
      {err && <p className="text-red-400/80 text-sm mb-3">{err}</p>}

      {/* Existing images */}
      <div>
        <p className="text-xs text-muted-foreground mb-2 font-body">{images.length} image{images.length === 1 ? "" : "s"} on this page</p>
        {images.length === 0 ? (
          <p className="text-muted-foreground/60 text-sm py-4 text-center">No images yet — upload the first one above.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border/40">
                <img src={img.publicUrl} alt={img.caption || ""} className="w-full h-28 object-cover" />
                {img.caption && <p className="absolute bottom-0 left-0 right-0 text-xs text-white bg-black/60 p-1 truncate">{img.caption}</p>}
                <button
                  onClick={() => remove(img.id, img.image_path)}
                  className="absolute top-1 right-1 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPageEditor;

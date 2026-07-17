import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSite } from "@/context/SiteContext";
import { supabase } from "@/integrations/supabase/client";
import {
  BookOpen, ChevronLeft, Search, Plus, Edit3, Trash2, Save, X,
  Loader2, Shield, Feather,
} from "lucide-react";

type Entry = {
  id: string;
  title: string;
  category: string | null;
  body: string;
  steps: string[] | null;
  tags: string[] | null;
  sort_order: number;
  is_published: boolean;
};

const ManualPage = () => {
  const { isAdmin, adminToken } = useSite();
  const nav = useNavigate();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Entry | null>(null);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Entry | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("manual_entries")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    setEntries((data ?? []) as Entry[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = entries.filter((e) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      (e.category ?? "").toLowerCase().includes(q) ||
      e.body.toLowerCase().includes(q)
    );
  });

  const save = async () => {
    if (!editing || !adminToken) return;
    setSaving(true);
    const { error } = await supabase.functions.invoke("admin-mutate", {
      body: {
        action: "manual-upsert",
        id: editing.id || undefined,
        title: editing.title,
        category: editing.category,
        body: editing.body,
        steps: editing.steps,
        tags: editing.tags,
        sort_order: editing.sort_order,
        is_published: editing.is_published,
      },
      headers: { "x-admin-token": adminToken },
    });
    setSaving(false);
    if (!error) {
      setEditing(null);
      await load();
    }
  };

  const del = async (id: string) => {
    if (!adminToken) return;
    if (!confirm("Delete this entry?")) return;
    await supabase.functions.invoke("admin-mutate", {
      body: { action: "manual-delete", id },
      headers: { "x-admin-token": adminToken },
    });
    setSelected(null);
    await load();
  };

  const newEntry = (): Entry => ({
    id: "", title: "", category: "", body: "", steps: null, tags: null,
    sort_order: entries.length, is_published: true,
  });

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 relative">
      {/* Ambient glass background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="blob blob-1" style={{ opacity: 0.5 }} />
        <div className="blob blob-3" style={{ opacity: 0.4 }} />
        <div className="absolute inset-0 bg-grid opacity-40" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => nav(-1)}
          className="flex items-center gap-1.5 text-xs font-body tracking-widest uppercase text-muted-foreground/60 hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> back
        </button>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 chip-glass mb-4">
            <Feather className="w-3 h-3" /> private journal
          </div>
          <h1
            className="font-display text-5xl md:text-6xl mb-3 tracking-tight"
            style={{
              background: "linear-gradient(135deg, hsl(338 80% 78%), hsl(30 20% 93%) 45%, hsl(355 70% 72%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "0.02em",
            }}
          >
            THE MANUAL
          </h1>
          <p className="font-script text-lg text-muted-foreground/70 italic">
            a guide of things worth knowing
          </p>
        </div>

        {/* Toolbar */}
        <div className="liquid-glass p-3 mb-6 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-3">
            <Search className="w-4 h-4 text-muted-foreground/60" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entries…"
              className="flex-1 bg-transparent border-0 outline-none py-2 text-sm font-body placeholder:text-muted-foreground/40"
            />
          </div>
          {isAdmin && (
            <>
              <div className="chip-glass"><Shield className="w-3 h-3" /> admin</div>
              <button
                onClick={() => setEditing(newEntry())}
                className="btn-liquid rounded-xl px-4 py-2 text-xs font-display tracking-wider inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </>
          )}
        </div>

        {/* Entry list */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="liquid-glass p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-body text-muted-foreground/60 text-sm">The pages are empty for now.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelected(e)}
                className="liquid-glass liquid-sheen text-left p-6 group hover:scale-[1.01] transition-transform"
              >
                {e.category && (
                  <div className="chip-glass mb-3">{e.category}</div>
                )}
                <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                  {e.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground/70 line-clamp-3 leading-relaxed">
                  {e.body}
                </p>
                {e.tags && e.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {e.tags.slice(0, 4).map((t) => (
                      <span key={t} className="chip-glass !text-[9px]">{t}</span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reader modal */}
      {selected && !editing && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ background: "hsl(340 18% 3% / 0.85)", backdropFilter: "blur(24px)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="liquid-glass-strong grain relative max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 md:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6 gap-4">
              <div>
                {selected.category && <div className="chip-glass mb-3">{selected.category}</div>}
                <h2 className="font-display text-3xl md:text-4xl gradient-text mb-1">{selected.title}</h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full liquid-glass-soft flex items-center justify-center text-muted-foreground hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="prose prose-invert max-w-none font-body text-foreground/85 whitespace-pre-wrap leading-relaxed text-[15px]">
              {selected.body}
            </div>

            {selected.steps && selected.steps.length > 0 && (
              <ol className="mt-6 space-y-2 font-body text-sm">
                {selected.steps.map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full liquid-glass-soft flex items-center justify-center text-xs text-primary font-display shrink-0">{i + 1}</span>
                    <span className="text-foreground/80 pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            )}

            {isAdmin && (
              <div className="flex gap-2 mt-8 pt-6 border-t border-border/30">
                <button
                  onClick={() => setEditing(selected)}
                  className="flex-1 py-2.5 rounded-xl liquid-glass-soft text-sm font-display tracking-wide inline-flex items-center justify-center gap-2 hover:text-primary"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => del(selected.id)}
                  className="py-2.5 px-4 rounded-xl text-sm font-display tracking-wide inline-flex items-center gap-2 text-destructive/80 hover:text-destructive border border-destructive/20 hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor modal (admin) */}
      {editing && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: "hsl(340 18% 3% / 0.9)", backdropFilter: "blur(24px)" }}
        >
          <div className="liquid-glass-strong grain relative max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl gradient-text">
                {editing.id ? "Edit entry" : "New entry"}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="w-9 h-9 rounded-full liquid-glass-soft flex items-center justify-center text-muted-foreground hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Title"
                className="w-full liquid-glass-soft rounded-xl px-4 py-3 font-display text-lg outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={editing.category ?? ""}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="Category (optional)"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                value={editing.body}
                onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                placeholder="Write it here…"
                rows={12}
                className="w-full liquid-glass-soft rounded-xl px-4 py-3 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y leading-relaxed"
              />
              <input
                value={(editing.tags ?? []).join(", ")}
                onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                placeholder="Tags, comma separated"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-xs outline-none focus:ring-2 focus:ring-primary/40"
              />

              <label className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <input
                  type="checkbox"
                  checked={editing.is_published}
                  onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                />
                Published (visible to her)
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 rounded-xl liquid-glass-soft text-sm font-display tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !editing.title || !editing.body}
                  className="flex-1 py-3 btn-liquid rounded-xl text-sm font-display tracking-wide inline-flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualPage;
import { useEffect, useState } from "react";
import {
  Gift, Check, Copy, Lock, Loader2, Shield, Plus, Edit3, Trash2, Save, X,
  Landmark, Smartphone, Wallet, CreditCard, Coins, ExternalLink, Heart,
} from "lucide-react";
import { useSite } from "@/context/SiteContext";
import { supabase } from "@/integrations/supabase/client";

type PaymentMethod = {
  id: string;
  kind: "bank" | "mobile" | "paypal" | "card" | "crypto" | "other" | string;
  label: string;
  account_name: string | null;
  account_value: string;
  instructions: string | null;
  deep_link: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

const KIND_OPTIONS: { value: PaymentMethod["kind"]; label: string; Icon: typeof Landmark }[] = [
  { value: "bank",   label: "Bank",         Icon: Landmark },
  { value: "mobile", label: "Mobile money", Icon: Smartphone },
  { value: "paypal", label: "PayPal",       Icon: Wallet },
  { value: "card",   label: "Card",         Icon: CreditCard },
  { value: "crypto", label: "Crypto",       Icon: Coins },
  { value: "other",  label: "Other",        Icon: Gift },
];

const iconFor = (kind: string) =>
  KIND_OPTIONS.find((k) => k.value === kind)?.Icon ?? Gift;

const GiftPage = () => {
  const { isAdmin, adminToken } = useSite();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("payment_methods").select("*").order("sort_order", { ascending: true });
    if (!isAdmin) q = q.eq("is_active", true);
    const { data } = await q;
    setMethods((data ?? []) as PaymentMethod[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [isAdmin]);

  const copy = async (m: PaymentMethod) => {
    try {
      await navigator.clipboard.writeText(m.account_value);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId((c) => (c === m.id ? null : c)), 1500);
    } catch {/* ignore */}
  };

  const blank = (): PaymentMethod => ({
    id: "", kind: "bank", label: "", account_name: "", account_value: "",
    instructions: "", deep_link: "", icon: null,
    sort_order: methods.length * 10, is_active: true,
  });

  const save = async () => {
    if (!editing || !adminToken) return;
    setSaving(true);
    const { error } = await supabase.functions.invoke("admin-mutate", {
      body: {
        action: "payment-upsert",
        id: editing.id || undefined,
        kind: editing.kind,
        label: editing.label,
        account_name: editing.account_name,
        account_value: editing.account_value,
        instructions: editing.instructions,
        deep_link: editing.deep_link,
        sort_order: editing.sort_order,
        is_active: editing.is_active,
      },
      headers: { "x-admin-token": adminToken },
    });
    setSaving(false);
    if (!error) { setEditing(null); await load(); }
  };

  const remove = async (id: string) => {
    if (!adminToken || !confirm("Delete this payment method?")) return;
    await supabase.functions.invoke("admin-mutate", {
      body: { action: "payment-delete", id },
      headers: { "x-admin-token": adminToken },
    });
    await load();
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 relative">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, hsl(340 18% 5% / 0.7) 100%)"
        }} />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 liquid-glass liquid-sheen">
            <Gift className="w-7 h-7 text-primary" />
          </div>
          <div className="chip-glass inline-flex mb-3">
            <Heart className="w-3 h-3" /> a gift, from him
          </div>
          <h1 className="text-4xl md:text-5xl font-display gradient-text mb-3 tracking-tight">Send with Love</h1>
          <p className="text-muted-foreground font-body text-sm max-w-md mx-auto leading-relaxed">
            Choose how you'd like to send a little something. Tap any card to copy the details or open the app.
          </p>
        </div>

        {isAdmin && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditing(blank())}
              className="btn-liquid rounded-xl px-4 py-2 text-xs font-display tracking-wider inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add method
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
          </div>
        ) : methods.length === 0 ? (
          <div className="liquid-glass p-12 text-center">
            <Lock className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-body text-muted-foreground/60 text-sm">
              He hasn't set up any transfer methods yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {methods.map((m) => {
              const Icon = iconFor(m.kind);
              const copied = copiedId === m.id;
              return (
                <div
                  key={m.id}
                  className={`liquid-glass liquid-sheen p-5 relative ${!m.is_active ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl liquid-glass-soft flex items-center justify-center text-primary shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-base text-foreground truncate">{m.label}</h3>
                        <span className="chip-glass !text-[9px]">{m.kind}</span>
                        {!m.is_active && <span className="chip-glass !text-[9px]">hidden</span>}
                      </div>
                      {m.account_name && (
                        <p className="text-xs font-body text-muted-foreground/70 truncate">{m.account_name}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => copy(m)}
                    className="w-full text-left liquid-glass-soft rounded-xl px-3.5 py-3 mb-3 hover:ring-1 hover:ring-primary/40 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-foreground/90 truncate">{m.account_value}</span>
                      <span className={`text-xs font-body inline-flex items-center gap-1 shrink-0 ${copied ? "text-green-400" : "text-primary/70"}`}>
                        {copied ? <><Check className="w-3 h-3" /> copied</> : <><Copy className="w-3 h-3" /> copy</>}
                      </span>
                    </div>
                  </button>

                  {m.instructions && (
                    <p className="text-[11px] font-body text-muted-foreground/60 leading-relaxed mb-3">
                      {m.instructions}
                    </p>
                  )}

                  {m.deep_link && (
                    <a
                      href={m.deep_link}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-liquid rounded-xl w-full py-2.5 text-xs font-display tracking-wider inline-flex items-center justify-center gap-1.5"
                    >
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {isAdmin && (
                    <div className="flex gap-1 mt-3 pt-3 border-t border-border/20">
                      <button
                        onClick={() => setEditing(m)}
                        className="flex-1 py-1.5 rounded-lg text-[11px] font-display tracking-wider text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" /> edit
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        className="py-1.5 px-3 rounded-lg text-[11px] font-display tracking-wider text-destructive/70 hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[11px] font-body text-muted-foreground/40 mt-8 max-w-md mx-auto leading-relaxed">
          Whatever you send — it's the thought that carries. He picked these so it'd be easy from anywhere.
        </p>
      </div>

      {editing && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          style={{ background: "hsl(340 18% 3% / 0.9)", backdropFilter: "blur(24px)" }}
        >
          <div className="liquid-glass-strong grain relative max-w-lg w-full max-h-[90vh] overflow-y-auto p-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h2 className="font-display text-xl gradient-text">
                  {editing.id ? "Edit method" : "Add method"}
                </h2>
              </div>
              <button
                onClick={() => setEditing(null)}
                className="w-9 h-9 rounded-full liquid-glass-soft flex items-center justify-center text-muted-foreground hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {KIND_OPTIONS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setEditing({ ...editing, kind: value })}
                    className={`liquid-glass-soft rounded-xl py-2.5 px-2 text-[11px] font-display tracking-wider inline-flex flex-col items-center gap-1 transition-all ${editing.kind === value ? "ring-1 ring-primary text-primary" : "text-muted-foreground"}`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              <input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder="Label — e.g. 'Bank Transfer' or 'M-Pesa'"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={editing.account_name ?? ""}
                onChange={(e) => setEditing({ ...editing, account_name: e.target.value })}
                placeholder="Account holder / display name"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={editing.account_value}
                onChange={(e) => setEditing({ ...editing, account_value: e.target.value })}
                placeholder="Number / IBAN / email / address"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                value={editing.instructions ?? ""}
                onChange={(e) => setEditing({ ...editing, instructions: e.target.value })}
                placeholder="Short instructions (optional)"
                rows={2}
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              />
              <input
                value={editing.deep_link ?? ""}
                onChange={(e) => setEditing({ ...editing, deep_link: e.target.value })}
                placeholder="Deep link / payment URL (optional)"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />

              <label className="flex items-center gap-2 text-xs font-body text-muted-foreground pt-1">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                Active (visible to her)
              </label>

              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 rounded-xl liquid-glass-soft text-sm font-display tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !editing.label || !editing.account_value}
                  className="flex-1 py-2.5 btn-liquid rounded-xl text-sm font-display tracking-wide inline-flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftPage;
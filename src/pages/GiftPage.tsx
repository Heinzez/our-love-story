import { useEffect, useMemo, useState } from "react";
import {
  Gift, Check, Copy, Loader2, Plus, Edit3, Trash2, Save, X, Landmark, Smartphone,
  Wallet, CreditCard, Coins, ExternalLink, Heart, Eye, EyeOff, Sparkles, PiggyBank,
  ShieldCheck, Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type PayoutMethod = {
  id: string;
  kind: "bank" | "paypal" | "card" | "crypto" | "mobile" | "other" | string;
  label: string;
  account_name: string | null;
  account_value: string;
  instructions: string | null;
  deep_link: string | null;
  sort_order: number;
  is_active: boolean;
};

const KINDS: { value: PayoutMethod["kind"]; label: string; Icon: typeof Landmark; hint: string; placeholder: string }[] = [
  { value: "mobile", label: "Mobile Money", Icon: Smartphone, hint: "Your M-Pesa / mobile money number", placeholder: "+254 7•• ••• •••" },
  { value: "bank",   label: "Bank",         Icon: Landmark,   hint: "Account or IBAN for direct deposit",   placeholder: "IBAN / account number" },
  { value: "paypal", label: "PayPal",       Icon: Wallet,     hint: "Email tied to your PayPal",           placeholder: "you@paypal.com" },
  { value: "card",   label: "Card",         Icon: CreditCard, hint: "Direct card deposit or link",         placeholder: "Card number or link" },
  { value: "crypto", label: "Crypto",       Icon: Coins,      hint: "Wallet address (BTC, ETH, USDT…)",    placeholder: "0x… or bc1…" },
  { value: "other",  label: "Other",        Icon: Gift,       hint: "Anything else",                        placeholder: "Details" },
];

const iconFor = (k: string) => KINDS.find((x) => x.value === k)?.Icon ?? Gift;

function buildAction(m: PayoutMethod): { href: string; label: string } | null {
  const v = m.account_value.trim();
  if (m.deep_link) return { href: m.deep_link, label: "Open" };
  if (m.kind === "paypal") {
    const isEmail = /@/.test(v);
    return isEmail
      ? { href: `https://www.paypal.com/paypalme/${encodeURIComponent(v.split("@")[0])}`, label: "Open PayPal" }
      : { href: `https://www.paypal.com/paypalme/${encodeURIComponent(v.replace(/^@/, ""))}`, label: "Open PayPal.me" };
  }
  if (m.kind === "mobile") {
    const tel = v.replace(/[^\d+]/g, "");
    return { href: `tel:${tel}`, label: "Dial number" };
  }
  if (m.kind === "crypto") {
    if (/^0x[a-fA-F0-9]{40}$/.test(v)) return { href: `ethereum:${v}`, label: "Open in wallet" };
    if (/^(bc1|[13])/.test(v)) return { href: `bitcoin:${v}`, label: "Open in wallet" };
  }
  return null;
}

const GiftPage = () => {
  const [methods, setMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<PayoutMethod | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<PayoutMethod | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .order("sort_order", { ascending: true });
    setMethods((data ?? []) as PayoutMethod[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const copy = async (m: PayoutMethod) => {
    try {
      await navigator.clipboard.writeText(m.account_value);
      setCopiedId(m.id);
      setTimeout(() => setCopiedId((c) => (c === m.id ? null : c)), 1500);
    } catch { /* ignore */ }
  };

  const blank = (kind: PayoutMethod["kind"] = "paypal"): PayoutMethod => ({
    id: "", kind, label: KINDS.find((k) => k.value === kind)?.label ?? "New method",
    account_name: "", account_value: "", instructions: "", deep_link: "",
    sort_order: methods.length * 10, is_active: true,
  });

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await supabase.functions.invoke("admin-mutate", {
      body: {
        action: "her-payout-upsert",
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
    });
    setSaving(false);
    if (!error) { setEditing(null); await load(); }
  };

  const remove = async (id: string) => {
    await supabase.functions.invoke("admin-mutate", {
      body: { action: "her-payout-delete", id },
    });
    setConfirmDelete(null);
    await load();
  };

  const toggleActive = async (m: PayoutMethod) => {
    await supabase.functions.invoke("admin-mutate", {
      body: { action: "her-payout-toggle", id: m.id, is_active: !m.is_active },
    });
    await load();
  };

  const activeCount = useMemo(() => methods.filter((m) => m.is_active).length, [methods]);
  const totalCount = methods.length;

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
            <PiggyBank className="w-7 h-7 text-primary" />
          </div>
          <div className="chip-glass inline-flex mb-3">
            <Heart className="w-3 h-3" /> for you, my love
          </div>
          <h1 className="text-4xl md:text-5xl font-display gradient-text mb-3 tracking-tight">
            Your Receiving Setup
          </h1>
          <p className="text-muted-foreground font-body text-sm max-w-md mx-auto leading-relaxed">
            Save the places you'd like to receive money — mobile money, bank, PayPal, card, or crypto.
            Everything stays encrypted in your private backend. Only you manage it. 💕
          </p>
          <div className="mt-4 inline-flex items-center gap-1.5 chip-glass text-[10px]">
            <ShieldCheck className="w-3 h-3 text-primary" /> stored securely — only you can edit
          </div>
        </div>

        {/* Summary strip */}
        <div className="liquid-glass p-4 mb-6 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl liquid-glass-soft flex items-center justify-center text-primary">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display text-sm">
                {activeCount} active · {totalCount} saved
              </div>
              <div className="text-[11px] text-muted-foreground/70 font-body">
                Add or update anytime — changes save instantly
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(blank("mobile"))}
            className="btn-liquid rounded-full px-4 py-2 text-xs font-display tracking-wider inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add method
          </button>
        </div>

        {/* Quick-add shortcuts — all 6 kinds */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-6">
          {KINDS.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => setEditing(blank(value))}
              className="liquid-glass-soft rounded-xl py-3 px-2 text-[10px] font-display tracking-wider inline-flex flex-col items-center gap-1.5 hover:ring-1 hover:ring-primary/40 text-muted-foreground hover:text-primary transition-all"
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
          </div>
        ) : methods.length === 0 ? (
          <div className="liquid-glass p-12 text-center">
            <Sparkles className="w-10 h-10 text-primary/40 mx-auto mb-3" />
            <p className="font-body text-muted-foreground/70 text-sm mb-4">
              Nothing saved yet. Tap a method above to add your first one.
            </p>
            <button
              onClick={() => setEditing(blank("mobile"))}
              className="btn-liquid rounded-full px-5 py-2.5 text-xs font-display tracking-wider inline-flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" /> Start with Mobile Money
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {methods.map((m) => {
              const Icon = iconFor(m.kind);
              const copied = copiedId === m.id;
              const action = buildAction(m);
              return (
                <div
                  key={m.id}
                  className={`liquid-glass liquid-sheen p-5 relative ${!m.is_active ? "opacity-60" : ""}`}
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

                  <div className="flex gap-2">
                    {action && (
                      <a
                        href={action.href}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-liquid rounded-xl flex-1 py-2.5 text-xs font-display tracking-wider inline-flex items-center justify-center gap-1.5"
                      >
                        {action.label} <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <button
                      onClick={() => copy(m)}
                      className="rounded-xl liquid-glass-soft px-4 py-2.5 text-xs font-display tracking-wider inline-flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary"
                    >
                      <Copy className="w-3 h-3" /> Copy
                    </button>
                  </div>

                  {/* She can manage her own — edit / hide / delete without admin token */}
                  <div className="flex gap-1 mt-3 pt-3 border-t border-border/20">
                    <button
                      onClick={() => setEditing(m)}
                      className="flex-1 py-1.5 rounded-lg text-[11px] font-display tracking-wider text-muted-foreground hover:text-primary inline-flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> edit
                    </button>
                    <button
                      onClick={() => toggleActive(m)}
                      className="py-1.5 px-3 rounded-lg text-[11px] font-display tracking-wider text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                      title={m.is_active ? "Hide" : "Show"}
                    >
                      {m.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(m)}
                      className="py-1.5 px-3 rounded-lg text-[11px] font-display tracking-wider text-destructive/70 hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-center text-[11px] font-body text-muted-foreground/40 mt-8 max-w-md mx-auto leading-relaxed">
          You have {activeCount} active {activeCount === 1 ? "method" : "methods"} ready to receive.
          <br />
          Mr.Mwendwa — always yours ❤️💍
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
                <PiggyBank className="w-4 h-4 text-primary" />
                <h2 className="font-display text-xl gradient-text">
                  {editing.id ? "Edit method" : "Add receiving method"}
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
                {KINDS.map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    onClick={() => setEditing({ ...editing, kind: value })}
                    className={`liquid-glass-soft rounded-xl py-2.5 px-2 text-[11px] font-display tracking-wider inline-flex flex-col items-center gap-1 transition-all ${editing.kind === value ? "ring-1 ring-primary text-primary" : "text-muted-foreground"}`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              <p className="text-[11px] font-body text-muted-foreground/60 -mt-1">
                {KINDS.find((k) => k.value === editing.kind)?.hint}
              </p>

              <input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                placeholder="Label — e.g. 'Main PayPal' or 'Equity Bank'"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={editing.account_name ?? ""}
                onChange={(e) => setEditing({ ...editing, account_name: e.target.value })}
                placeholder="Account holder name (optional)"
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <input
                value={editing.account_value}
                onChange={(e) => setEditing({ ...editing, account_value: e.target.value })}
                placeholder={KINDS.find((k) => k.value === editing.kind)?.placeholder}
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-primary/40"
              />
              <textarea
                value={editing.instructions ?? ""}
                onChange={(e) => setEditing({ ...editing, instructions: e.target.value })}
                placeholder="Notes (optional) — e.g. reference to include"
                rows={2}
                className="w-full liquid-glass-soft rounded-xl px-4 py-2.5 font-body text-sm outline-none focus:ring-2 focus:ring-primary/40 resize-y"
              />

              <label className="flex items-center gap-2 text-xs font-body text-muted-foreground pt-1">
                <input
                  type="checkbox"
                  checked={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                />
                Active
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
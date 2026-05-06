import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gift, Check, Send, ChevronRight, Lock, Loader2, History, Shield, AlertCircle } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import { supabase } from "@/integrations/supabase/client";

const post = async (url: string, body: unknown) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Request failed");
  }
  return res.json();
};

type LookupResult = { phone: string; name: string; verified: boolean };
type GiftTx = { id: string; phoneNumber: string; recipientName: string | null; amountKes: number; status: string; createdAt: string };
type Settings = { giftLocked: boolean; weeklyGiftAmount: number };
type DailySent = { totalSent: number; remaining: number; dailyLimit: number };

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const GiftPageContent = () => {
  const { isAdmin } = useSite();
  const qc = useQueryClient();

  const [phone, setPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [sendAmount, setSendAmount] = useState<number | "">("");
  const [customInput, setCustomInput] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [lookup, setLookup] = useState<LookupResult | null>(null);
  const [step, setStep] = useState<"input" | "confirm" | "done">("input");
  const [adminAmount, setAdminAmount] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const { data: balanceData } = useQuery<{ amountKes: number }>({
    queryKey: ["/api/gift/balance"],
    queryFn: () => fetch("/api/gift/balance").then((r) => r.json()),
  });

  const { data: settings } = useQuery<Settings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-mutate", { body: { action: "get-settings" } });
      if (error) throw new Error(error.message);
      return data as Settings;
    },
  });

  const { data: dailyData } = useQuery<DailySent>({
    queryKey: ["/api/gift/daily-sent"],
    queryFn: () => fetch("/api/gift/daily-sent").then((r) => r.json()),
    refetchInterval: 60_000,
  });

  const { data: history = [] } = useQuery<GiftTx[]>({
    queryKey: ["/api/gift/history"],
    queryFn: () => fetch("/api/gift/history").then((r) => r.json()),
    enabled: showHistory,
  });

  const lookupMutation = useMutation({
    mutationFn: (vars: { phone: string; recipientName: string }) =>
      post("/api/gift/lookup", vars) as Promise<LookupResult>,
    onSuccess: (data) => { setLookup(data); setStep("confirm"); },
  });

  const sendMutation = useMutation({
    mutationFn: () => post("/api/gift/send", {
      phone: lookup!.phone,
      recipientName: lookup!.name,
      amountKes: Number(sendAmount),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/gift/balance"] });
      qc.invalidateQueries({ queryKey: ["/api/gift/history"] });
      qc.invalidateQueries({ queryKey: ["/api/gift/daily-sent"] });
      setStep("done");
    },
  });

  const depositMutation = useMutation({
    mutationFn: (kes: number) => post("/api/gift/balance", { amountKes: kes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/gift/balance"] });
      setAdminAmount("");
    },
  });

  const balance = balanceData?.amountKes ?? 0;
  const giftLocked = settings?.giftLocked ?? false;
  const dailyRemaining = dailyData?.remaining ?? 5000;
  const dailyLimit = dailyData?.dailyLimit ?? 5000;
  const totalSentToday = dailyData?.totalSent ?? 0;

  // Max sendable = min(balance, daily remaining)
  const maxSendable = Math.min(balance, dailyRemaining);
  const hasBalance = balance > 0 && dailyRemaining > 0;

  // Set a sensible default amount when data loads
  useEffect(() => {
    if (sendAmount === "" && maxSendable > 0) {
      const defaultAmt = QUICK_AMOUNTS.filter(a => a <= maxSendable).at(-1) || maxSendable;
      setSendAmount(defaultAmt);
    }
  }, [maxSendable]);

  const handleAmountSelect = (amt: number) => {
    if (amt > maxSendable) return;
    setSendAmount(amt);
    setUseCustom(false);
    setCustomInput("");
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const n = parseInt(val, 10);
    if (!isNaN(n) && n > 0) setSendAmount(Math.min(n, maxSendable));
    else setSendAmount("");
  };

  const handleLookup = () => {
    if (!phone.trim() || !sendAmount) return;
    lookupMutation.mutate({ phone: phone.trim(), recipientName: recipientName.trim() });
  };

  const handleSend = () => { if (!lookup) return; sendMutation.mutate(); };

  const resetFlow = () => {
    setPhone(""); setRecipientName(""); setLookup(null); setStep("input");
  };

  const showLocked = giftLocked && !isAdmin;
  const amountValid = sendAmount !== "" && Number(sendAmount) > 0 && Number(sendAmount) <= maxSendable;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, hsl(338 80% 62% / 0.2), hsl(355 70% 65% / 0.15))", border: "1px solid hsl(338 80% 62% / 0.25)" }}>
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-display gradient-text mb-2">Weekly Gift</h1>
          <p className="text-muted-foreground font-body text-sm">A little something for my queen, every week.</p>
        </div>

        {/* Balance + daily info */}
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: "hsl(338 80% 62% / 0.07)", border: "1px solid hsl(338 80% 62% / 0.18)" }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground font-body tracking-widest uppercase mb-0.5">Available</p>
              <p className="text-3xl font-display text-primary">KES {balance.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-muted-foreground font-body tracking-widest uppercase mb-0.5">Daily limit</p>
              <p className="text-base font-display text-foreground/80">
                KES {dailyRemaining.toLocaleString()} left
              </p>
              <p className="text-[11px] text-muted-foreground/50 font-body">
                {totalSentToday > 0 ? `${totalSentToday.toLocaleString()} sent today` : `of ${dailyLimit.toLocaleString()} / day`}
              </p>
            </div>
          </div>
          {balance === 0 && (
            <p className="text-xs text-muted-foreground/50 font-body mt-2 text-center">Waiting for a deposit...</p>
          )}
        </div>

        {/* Admin panel */}
        {isAdmin && (
          <div className="rounded-2xl p-5 mb-5 space-y-4"
            style={{ background: "hsl(338 80% 62% / 0.05)", border: "1px dashed hsl(338 80% 62% / 0.3)" }}>
            <div className="flex items-center gap-2 text-sm font-body text-primary">
              <Shield className="w-4 h-4" />
              Admin — Deposit Gift Balance
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-body">KES</span>
                <input
                  type="number"
                  value={adminAmount}
                  onChange={(e) => setAdminAmount(e.target.value)}
                  placeholder="Amount to deposit"
                  className="w-full bg-muted/20 border border-border/30 rounded-xl px-3 py-2.5 pl-12 text-foreground font-body text-sm focus:outline-none focus:border-primary/40"
                />
              </div>
              <button
                onClick={() => depositMutation.mutate(Number(adminAmount))}
                disabled={!adminAmount || depositMutation.isPending}
                className="px-5 py-2.5 rounded-xl font-display text-sm tracking-wide text-primary-foreground transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}
              >
                {depositMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deposit"}
              </button>
            </div>
            {giftLocked && (
              <div className="flex items-center gap-2 text-xs font-body text-amber-400/80 px-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Gift page is locked. Go to Admin Panel to unlock it for her.
              </div>
            )}
          </div>
        )}

        {/* Locked state */}
        {showLocked ? (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.12)" }}>
            <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">Your gift is being prepared.</p>
            <p className="text-muted-foreground/60 font-body text-xs mt-1">Check back soon ❤️</p>
          </div>
        ) : !hasBalance && !isAdmin ? (
          <div className="rounded-2xl p-8 text-center"
            style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.12)" }}>
            <Lock className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-muted-foreground font-body text-sm">
              {balance === 0 ? "He's loading up your gift..." : "Daily limit reached — come back tomorrow ❤️"}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(338 80% 62% / 0.15)" }}>

            {/* ── Step 1 — phone + name + amount ── */}
            {step === "input" && (
              <div className="p-6 space-y-5">
                <p className="text-sm font-body text-muted-foreground text-center">
                  Enter your M-Pesa number to receive your gift
                </p>

                {/* Phone */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-body text-sm">🇰🇪 +254</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="7XX XXX XXX"
                    className="w-full bg-muted/20 border border-border/30 rounded-xl px-3 py-3 pl-20 text-foreground font-body text-sm focus:outline-none focus:border-primary/40 tracking-wider"
                  />
                </div>

                {/* Name (optional) */}
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="w-full bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40"
                />

                {/* ── Amount selector ── */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-body text-muted-foreground/70 tracking-wide uppercase">Choose amount</p>
                    <p className="text-[11px] font-body text-muted-foreground/50">
                      max KES {maxSendable.toLocaleString()} today
                    </p>
                  </div>

                  {/* Quick-select pills */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {QUICK_AMOUNTS.map((amt) => {
                      const disabled = amt > maxSendable;
                      const selected = !useCustom && sendAmount === amt;
                      return (
                        <button
                          key={amt}
                          onClick={() => !disabled && handleAmountSelect(amt)}
                          disabled={disabled}
                          className="py-2.5 rounded-xl font-display text-sm tracking-wide transition-all"
                          style={selected
                            ? { background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))", color: "#fff" }
                            : disabled
                              ? { background: "hsl(0 0% 100% / 0.02)", color: "hsl(30 10% 35%)", border: "1px solid hsl(338 80% 62% / 0.06)", cursor: "not-allowed" }
                              : { background: "hsl(338 80% 62% / 0.08)", color: "hsl(338 80% 70%)", border: "1px solid hsl(338 80% 62% / 0.2)" }}
                        >
                          {amt.toLocaleString()}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom amount toggle */}
                  <button
                    onClick={() => { setUseCustom(!useCustom); if (!useCustom) { setSendAmount(""); setCustomInput(""); } }}
                    className="text-xs font-body text-muted-foreground/50 hover:text-primary/70 transition-colors mb-2 block"
                  >
                    {useCustom ? "Use quick select" : "Enter a custom amount"}
                  </button>

                  {useCustom && (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-body text-sm">KES</span>
                      <input
                        type="number"
                        value={customInput}
                        onChange={(e) => handleCustomChange(e.target.value)}
                        placeholder={`1 – ${maxSendable.toLocaleString()}`}
                        className="w-full bg-muted/20 border border-border/30 rounded-xl px-3 py-2.5 pl-12 text-foreground font-body text-sm focus:outline-none focus:border-primary/40"
                      />
                    </div>
                  )}

                  {/* Selected amount preview */}
                  {sendAmount !== "" && (
                    <p className="text-center text-primary/80 font-display text-base mt-3">
                      Sending KES {Number(sendAmount).toLocaleString()}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground/40 font-body text-center">
                  M-Pesa name is confirmed during the transaction itself.
                </p>

                <button
                  onClick={handleLookup}
                  disabled={!phone.trim() || !amountValid || lookupMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-display tracking-wide text-sm text-primary-foreground transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}
                >
                  {lookupMutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</>
                    : "Continue"}
                </button>

                {lookupMutation.isError && (
                  <p className="text-center text-red-400/80 text-xs font-body">
                    {(lookupMutation.error as Error)?.message}
                  </p>
                )}
              </div>
            )}

            {/* ── Step 2 — confirm ── */}
            {step === "confirm" && lookup && (
              <div className="p-6">
                <div className="flex items-center gap-2 mb-5 text-xs text-muted-foreground font-body">
                  <Check className="w-3.5 h-3.5 text-green-400" />
                  Number validated
                </div>

                <div className="rounded-xl p-5 mb-5"
                  style={{ background: "hsl(338 80% 62% / 0.08)", border: "1px solid hsl(338 80% 62% / 0.2)" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-primary-foreground font-display text-sm"
                      style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}>
                      {lookup.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-foreground font-display text-base">{lookup.name}</p>
                      <p className="text-muted-foreground font-body text-xs">{lookup.phone}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm font-body border-t pt-4"
                    style={{ borderColor: "hsl(338 80% 62% / 0.15)" }}>
                    <span className="text-muted-foreground">Gift amount</span>
                    <span className="text-primary font-display text-xl">KES {Number(sendAmount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={resetFlow}
                    className="flex-1 py-3 rounded-xl font-display text-sm tracking-wide text-muted-foreground border border-border/30 hover:bg-muted/20 transition-all">
                    Change
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm tracking-wide text-primary-foreground transition-all disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}
                  >
                    {sendMutation.isPending
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                      : <><Send className="w-4 h-4" /> Confirm & Send</>}
                  </button>
                </div>

                {sendMutation.isError && (
                  <p className="text-center text-red-400/80 text-xs font-body mt-3">
                    {(sendMutation.error as Error)?.message}
                  </p>
                )}
              </div>
            )}

            {/* ── Step 3 — done ── */}
            {step === "done" && (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "hsl(338 80% 62% / 0.15)", border: "1px solid hsl(338 80% 62% / 0.3)" }}>
                  <Check className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-display gradient-text mb-2">Gift Sent!</h3>
                <p className="text-muted-foreground font-body text-sm mb-1">
                  KES {Number(sendAmount).toLocaleString()} sent to {lookup?.phone}
                </p>
                <p className="text-muted-foreground/60 font-body text-xs mb-6">Check your M-Pesa for confirmation.</p>
                <button onClick={resetFlow}
                  className="text-primary/70 hover:text-primary font-body text-sm flex items-center gap-1 mx-auto transition-colors">
                  Send another <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* History */}
        <div className="mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm text-muted-foreground/60 hover:text-muted-foreground font-body transition-colors mx-auto"
          >
            <History className="w-3.5 h-3.5" />
            {showHistory ? "Hide" : "View"} gift history
          </button>

          {showHistory && history.length > 0 && (
            <div className="mt-4 space-y-2">
              {history.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between px-4 py-3 rounded-xl font-body text-sm"
                  style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.1)" }}>
                  <div>
                    <p className="text-foreground/80">{tx.recipientName || tx.phoneNumber}</p>
                    <p className="text-muted-foreground/50 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary">KES {tx.amountKes.toLocaleString()}</p>
                    <p className={`text-xs ${tx.status === "sent" ? "text-green-400/70" : "text-amber-400/70"}`}>{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {showHistory && history.length === 0 && (
            <p className="text-center text-muted-foreground/40 font-body text-xs mt-3">No gifts sent yet.</p>
          )}
        </div>

      </div>
    </div>
  );
};

const GiftPage = () => {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30">
        <GiftPageContent />
      </div>
      <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-5 text-center px-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "hsl(338 80% 62% / 0.15)", border: "1px solid hsl(338 80% 62% / 0.25)" }}>
            <Lock className="w-9 h-9 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-display gradient-text mb-2">Coming Soon</h2>
            <p className="text-muted-foreground font-body text-sm max-w-xs leading-relaxed">
              This feature is still being set up.<br />Check back soon, my love.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftPage;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, Mail, Lock, Unlock, Users, Gift, Send,
  Loader2, Check, ChevronDown, ChevronUp, Info, MessageCircle, RefreshCw,
} from "lucide-react";
import { useSite } from "@/context/SiteContext";
import AdminPageEditor from "@/components/AdminPageEditor";
import { supabase } from "@/integrations/supabase/client";

type Settings = { giftLocked: boolean; weeklyGiftAmount: number };
type Subscriber = { id: string; primaryEmail: string; backupEmail: string | null; subscribedAt: string };

const Section = ({ title, icon: Icon, children, defaultOpen = true }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.15)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "hsl(338 80% 62% / 0.12)" }}>
            <Icon className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display text-base text-foreground tracking-wide">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
};

const AdminPage = () => {
  const { isAdmin, adminToken } = useSite();
  const qc = useQueryClient();

  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailResult, setEmailResult] = useState<{ sent: number; message?: string } | null>(null);
  const [weeklyAmountInput, setWeeklyAmountInput] = useState("");
  const [tgStatus, setTgStatus] = useState<{ info?: { url?: string; pending_update_count?: number; last_error_message?: string }; expectedUrl?: string; lastUpdate?: { text?: string; received_at?: string; chat_id?: number } | null } | null>(null);
  const [tgBusy, setTgBusy] = useState(false);
  const [tgErr, setTgErr] = useState<string | null>(null);
  const [tgMsg, setTgMsg] = useState<string | null>(null);

  const callTg = async (action: "status" | "register") => {
    setTgBusy(true); setTgErr(null); setTgMsg(null);
    try {
      const { data, error } = await supabase.functions.invoke("telegram-admin", {
        body: { action },
        headers: adminToken ? { "x-admin-token": adminToken } : undefined,
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      if (action === "status") setTgStatus(data as typeof tgStatus);
      else { setTgMsg("Webhook re-registered."); await callTg("status"); }
    } catch (e) { setTgErr((e as Error).message); }
    finally { setTgBusy(false); }
  };

  const { data: settings } = useQuery<Settings>({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("admin-mutate", { body: { action: "get-settings" } });
      if (error) throw new Error(error.message);
      return data as Settings;
    },
  });

  const { data: subscribers = [] } = useQuery<Subscriber[]>({
    queryKey: ["subscribers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_subscribers")
        .select("id, primary_email, backup_email, subscribed_at")
        .order("subscribed_at", { ascending: false });
      if (error) return [];
      return (data ?? []).map((s: any) => ({
        id: s.id, primaryEmail: s.primary_email, backupEmail: s.backup_email, subscribedAt: s.subscribed_at,
      }));
    },
    enabled: isAdmin,
  });

  const settingsMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data, error } = await supabase.functions.invoke("admin-mutate", {
        body: { action: "set-setting", key, value },
        headers: adminToken ? { "x-admin-token": adminToken } : undefined,
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site-settings"] }),
  });

  const sendEmailMutation = useMutation({
    mutationFn: async () => {
      // Email sending isn't wired to an edge function yet. Show a friendly message.
      throw new Error("Email sending requires an SMTP edge function setup — coming soon.");
    },
    onSuccess: (data: { sent: number; message?: string }) => {
      setEmailResult(data);
      setEmailSubject("");
      setEmailMessage("");
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-body">Admin access required.</p>
        </div>
      </div>
    );
  }

  const giftLocked = settings?.giftLocked ?? false;
  const weeklyAmount = settings?.weeklyGiftAmount ?? 500;

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg, hsl(338 80% 62% / 0.2), hsl(355 70% 65% / 0.15))", border: "1px solid hsl(338 80% 62% / 0.25)" }}>
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-3xl font-display gradient-text mb-2">Admin Panel</h1>
          <p className="text-muted-foreground font-body text-sm">Only you can see this, my love.</p>
        </div>

        <div className="space-y-4">

          {/* Page editor (premiere dates + image uploads) */}
          <AdminPageEditor />

          {/* Telegram bot status */}
          <Section title="Telegram Bot Status" icon={MessageCircle} defaultOpen={false}>
            <div className="space-y-3">
              <div className="flex gap-2">
                <button onClick={() => callTg("status")} disabled={tgBusy} className="px-4 py-2 rounded-xl text-sm font-display border border-primary/40 hover:bg-primary/10 disabled:opacity-50">
                  {tgBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin inline" /> : "Check Status"}
                </button>
                <button onClick={() => callTg("register")} disabled={tgBusy} className="px-4 py-2 rounded-xl text-sm font-display text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}>
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1.5" /> Re-register Webhook
                </button>
              </div>
              {tgErr && <p className="text-red-400/80 text-sm">{tgErr}</p>}
              {tgMsg && <p className="text-primary text-sm">{tgMsg}</p>}
              {tgStatus && (
                <div className="space-y-2 text-xs font-body p-3 rounded-xl bg-muted/20 border border-border/30">
                  <p><span className="text-muted-foreground">Registered URL:</span> <span className="text-foreground break-all">{tgStatus.info?.url || "(none)"}</span></p>
                  <p><span className="text-muted-foreground">Expected URL:</span> <span className="text-foreground break-all">{tgStatus.expectedUrl}</span></p>
                  <p><span className="text-muted-foreground">Pending updates:</span> {tgStatus.info?.pending_update_count ?? 0}</p>
                  {tgStatus.info?.last_error_message && <p className="text-red-400/80">Last error: {tgStatus.info.last_error_message}</p>}
                  <div className="border-t border-border/30 pt-2 mt-2">
                    <p className="text-muted-foreground mb-1">Last received update:</p>
                    {tgStatus.lastUpdate ? (
                      <p className="text-foreground/80 italic">"{tgStatus.lastUpdate.text}" <span className="text-muted-foreground/60 text-[10px]">— {tgStatus.lastUpdate.received_at && new Date(tgStatus.lastUpdate.received_at).toLocaleString()}</span></p>
                    ) : <p className="text-muted-foreground/60">No updates received yet.</p>}
                  </div>
                </div>
              )}
              <p className="text-muted-foreground/50 text-[11px] font-body">Reply on Telegram with <code>/reply your message</code> to send messages back into the site chat.</p>
            </div>
          </Section>

          {/* Gift Settings */}
          <Section title="Gift Page Controls" icon={Gift}>
            <div className="space-y-5">

              {/* Lock/unlock toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: "hsl(338 80% 62% / 0.05)", border: "1px solid hsl(338 80% 62% / 0.12)" }}>
                <div>
                  <p className="text-foreground font-body text-sm mb-0.5">Gift Page Visibility</p>
                  <p className="text-muted-foreground font-body text-xs">
                    {giftLocked ? "She cannot see the gift form" : "She can see and use the gift page"}
                  </p>
                </div>
                <button
                  onClick={() => settingsMutation.mutate({ key: "gift_locked", value: giftLocked ? "false" : "true" })}
                  disabled={settingsMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-display text-sm tracking-wide transition-all"
                  style={giftLocked
                    ? { background: "hsl(338 80% 62% / 0.15)", border: "1px solid hsl(338 80% 62% / 0.3)", color: "hsl(338 80% 68%)" }
                    : { background: "hsl(338 80% 58%)", color: "#fff" }}
                >
                  {settingsMutation.isPending
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : giftLocked ? <><Unlock className="w-3.5 h-3.5" /> Unlock</> : <><Lock className="w-3.5 h-3.5" /> Lock</>}
                </button>
              </div>

              {/* Weekly amount */}
              <div>
                <p className="text-foreground font-body text-sm mb-2">Weekly Gift Amount</p>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-body text-sm">KES</span>
                    <input
                      type="number"
                      value={weeklyAmountInput}
                      onChange={(e) => setWeeklyAmountInput(e.target.value)}
                      placeholder={String(weeklyAmount)}
                      className="w-full bg-muted/20 border border-border/30 rounded-xl px-3 py-2.5 pl-12 text-foreground font-body text-sm focus:outline-none focus:border-primary/40"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!weeklyAmountInput) return;
                      settingsMutation.mutate({ key: "weekly_gift_amount", value: weeklyAmountInput });
                      setWeeklyAmountInput("");
                    }}
                    disabled={!weeklyAmountInput || settingsMutation.isPending}
                    className="px-5 py-2.5 rounded-xl font-display text-sm tracking-wide text-primary-foreground transition-all disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}
                  >
                    Save
                  </button>
                </div>
                <p className="text-muted-foreground/50 font-body text-xs mt-1.5">
                  Current weekly amount: KES {weeklyAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </Section>

          {/* Email Notification */}
          <Section title="Send Her a Notification" icon={Mail}>
            <div className="space-y-4">

              <div className="flex items-start gap-2 p-3 rounded-xl text-xs font-body"
                style={{ background: "hsl(38 65% 58% / 0.08)", border: "1px solid hsl(38 65% 58% / 0.2)", color: "hsl(38 65% 68%)" }}>
                <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-display mb-1">Setup required</p>
                  <p>Add <code className="bg-black/20 px-1 rounded">SMTP_HOST</code>, <code className="bg-black/20 px-1 rounded">SMTP_USER</code>, and <code className="bg-black/20 px-1 rounded">SMTP_PASS</code> as environment variables to enable email sending. Gmail users: use an App Password, not your regular password. Set <code className="bg-black/20 px-1 rounded">SMTP_PORT=587</code>.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-body text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                {subscribers.length === 0
                  ? "No subscribers yet"
                  : `${subscribers.length} subscriber${subscribers.length > 1 ? "s" : ""} — ${subscribers.map(s => s.primaryEmail).join(", ")}`}
              </div>

              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Subject — e.g. Just thinking of you..."
                className="w-full bg-muted/20 border border-border/30 rounded-xl px-4 py-2.5 text-foreground font-body text-sm focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40"
              />
              <textarea
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Write your message here... she will receive it by email."
                rows={5}
                className="w-full bg-muted/20 border border-border/30 rounded-xl px-4 py-3 text-foreground font-body text-sm focus:outline-none focus:border-primary/40 placeholder:text-muted-foreground/40 resize-none leading-relaxed"
              />

              {emailResult && (
                <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-body"
                  style={{ background: "hsl(338 80% 62% / 0.08)", border: "1px solid hsl(338 80% 62% / 0.2)", color: "hsl(338 80% 68%)" }}>
                  <Check className="w-4 h-4" />
                  {emailResult.message || `Sent to ${emailResult.sent} address${emailResult.sent !== 1 ? "es" : ""}.`}
                </div>
              )}

              {sendEmailMutation.isError && (
                <p className="text-red-400/80 font-body text-xs">
                  {(sendEmailMutation.error as Error)?.message}
                </p>
              )}

              <button
                onClick={() => { setEmailResult(null); sendEmailMutation.mutate(); }}
                disabled={!emailSubject.trim() || !emailMessage.trim() || sendEmailMutation.isPending || subscribers.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-display text-sm tracking-wide text-primary-foreground transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))" }}
              >
                {sendEmailMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                  : <><Send className="w-4 h-4" /> Send Notification</>}
              </button>
            </div>
          </Section>

          {/* Subscribers list */}
          <Section title="Subscribers" icon={Users} defaultOpen={false}>
            {subscribers.length === 0 ? (
              <p className="text-muted-foreground/50 font-body text-sm text-center py-4">
                No one has subscribed for notifications yet.
              </p>
            ) : (
              <div className="space-y-2">
                {subscribers.map((sub) => (
                  <div key={sub.id} className="flex items-start justify-between px-4 py-3 rounded-xl font-body text-sm"
                    style={{ background: "hsl(0 0% 100% / 0.02)", border: "1px solid hsl(338 80% 62% / 0.08)" }}>
                    <div>
                      <p className="text-foreground/80">{sub.primaryEmail}</p>
                      {sub.backupEmail && <p className="text-muted-foreground/50 text-xs">Backup: {sub.backupEmail}</p>}
                    </div>
                    <p className="text-muted-foreground/40 text-xs">{new Date(sub.subscribedAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* AT Info */}
          <Section title="About M-Pesa & Phone Lookup" icon={Info} defaultOpen={false}>
            <div className="space-y-3 text-sm font-body text-muted-foreground leading-relaxed">
              <p>
                <span className="text-foreground">Why can't the app look up her name from her phone number?</span>
              </p>
              <p>
                Neither Africa's Talking nor Safaricom's Daraja API provide a public endpoint to look up a subscriber's name from their phone number. This is a privacy restriction enforced by Safaricom.
              </p>
              <p>
                The name confirmation only happens <span className="text-foreground">during the M-Pesa transaction itself</span> — when she receives an STK push or confirmation SMS, her registered M-Pesa name appears in that message.
              </p>
              <p className="text-muted-foreground/60 text-xs">
                To do real M-Pesa B2C transfers, you would need Africa's Talking credentials (AT_API_KEY + AT_USERNAME) and an approved M-Pesa Business Paybill registered with Safaricom. The current implementation records the transaction locally.
              </p>
            </div>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default AdminPage;

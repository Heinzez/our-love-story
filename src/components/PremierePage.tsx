import { useState, useEffect } from "react";
import { useSite } from "@/context/SiteContext";
import { Calendar, Mail, Lock } from "lucide-react";

interface PremierePageProps {
  pageKey: string;
  title: string;
  emoji: string;
  premiereDate: Date; // fallback default
  description: string;
  children?: React.ReactNode;
}

const PremierePage = ({ pageKey, title, emoji, premiereDate, description, children }: PremierePageProps) => {
  const { isAdmin, subscribedEmail, setSubscribedEmail, pageSettings, pageImages } = useSite();
  const setting = pageSettings[pageKey];
  const effectiveDate = setting?.premiere_date ? new Date(setting.premiere_date) : premiereDate;
  const effectiveDesc = setting?.description ?? description;
  const images = pageImages[pageKey] ?? [];
  const [emailInput, setEmailInput] = useState("");
  const [backupEmail, setBackupEmail] = useState("");
  const [showBackup, setShowBackup] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const now = new Date();
  const isLive = now >= effectiveDate;

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState(() => effectiveDate.getTime() - Date.now());
  useEffect(() => {
    if (isLive) return;
    const id = setInterval(() => setTimeLeft(effectiveDate.getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [effectiveDate, isLive]);

  const days = Math.max(0, Math.floor(timeLeft / 86400000));
  const hours = Math.max(0, Math.floor((timeLeft / 3600000) % 24));
  const minutes = Math.max(0, Math.floor((timeLeft / 60000) % 60));
  const seconds = Math.max(0, Math.floor((timeLeft / 1000) % 60));

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBackup && emailInput.trim()) {
      setShowBackup(true);
      return;
    }
    if (emailInput.trim() && backupEmail.trim()) {
      setSubscribedEmail(emailInput.trim(), backupEmail.trim());
      setSubmitted(true);
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  if (isAdmin) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl p-8 mb-6">
            <h1 className="text-4xl font-display gradient-text mb-2">{emoji} {title}</h1>
            <p className="text-muted-foreground font-script text-xl mb-4">{effectiveDesc}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Premieres: {formatDate(effectiveDate)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${isLive ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
                {isLive ? "LIVE" : "Scheduled"}
              </span>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-display text-foreground mb-4">Uploaded Images</h2>
            {images.length === 0 ? (
              <p className="text-muted-foreground text-sm">No images yet. Use the <a href="/admin" className="text-primary underline">Admin editor</a> to upload.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img) => (
                  <figure key={img.id} className="rounded-xl overflow-hidden border border-border/40 bg-muted/20">
                    <img src={img.publicUrl} alt={img.caption || title} className="w-full h-40 object-cover" loading="lazy" />
                    {img.caption && <figcaption className="text-xs text-muted-foreground p-2">{img.caption}</figcaption>}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isLive && children) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-display gradient-text mb-8 text-center">{emoji} {title}</h1>
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {images.map((img) => (
              <figure key={img.id} className="rounded-xl overflow-hidden border border-border/40 bg-muted/20">
                <img src={img.publicUrl} alt={img.caption || title} className="w-full h-48 object-cover" loading="lazy" />
                {img.caption && <figcaption className="text-xs text-muted-foreground p-2 text-center">{img.caption}</figcaption>}
              </figure>
            ))}
          </div>
        )}
          {children}
          <div className="text-center mt-12 text-primary font-display text-sm tracking-wide">
            Mr.Mwendwa — always yours ❤️💍
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full text-center">
        <div className="glass-card rounded-2xl p-10 animate-fade-in-up">
          <div className="text-6xl mb-6">{emoji}</div>
          <h1 className="text-3xl font-display gradient-text mb-3">{title}</h1>
          <p className="text-muted-foreground font-script text-xl mb-6">{effectiveDesc}</p>
          
          <div className="flex items-center justify-center gap-2 mb-8 text-primary">
            <Lock className="w-5 h-5" />
            <span className="font-display text-lg">Premieres {formatDate(effectiveDate)}</span>
          </div>

          {!isLive && (
            <div className="grid grid-cols-4 gap-2 mb-8">
              {[
                { v: days, l: "Days" },
                { v: hours, l: "Hours" },
                { v: minutes, l: "Min" },
                { v: seconds, l: "Sec" },
              ].map((u) => (
                <div key={u.l} className="rounded-xl py-3 px-1 bg-muted/30 border border-primary/20">
                  <div className="font-display text-2xl gradient-text leading-none">{String(u.v).padStart(2, "0")}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{u.l}</div>
                </div>
              ))}
            </div>
          )}

          {subscribedEmail ? (
            <div className="bg-muted/30 rounded-xl p-4 animate-fade-in-up">
              <Mail className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-foreground font-body">You'll be notified upon premiere 💕</p>
              <p className="text-muted-foreground text-sm mt-1">{subscribedEmail}</p>
            </div>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              <p className="text-muted-foreground text-sm mb-2">Get notified when this page goes live</p>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email..."
                required
                className="w-full px-5 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-body transition-all"
              />
              {showBackup && (
                <input
                  type="email"
                  value={backupEmail}
                  onChange={(e) => setBackupEmail(e.target.value)}
                  placeholder="Input backup email for surprise 💕"
                  required
                  className="w-full px-5 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-center font-body transition-all animate-fade-in-up"
                />
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-display tracking-wide hover:opacity-90 transition-all"
              >
                {showBackup ? "Submit 💌" : "Notify Me 💌"}
              </button>
            </form>
          )}

          <div className="mt-6 text-primary font-display text-sm tracking-wide">
            Mr.Mwendwa — always yours ❤️💍
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremierePage;

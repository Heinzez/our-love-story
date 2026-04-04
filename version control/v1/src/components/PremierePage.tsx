import { useState } from "react";
import { useSite } from "@/context/SiteContext";
import { Calendar, Mail, Lock } from "lucide-react";

interface PremierePageProps {
  title: string;
  emoji: string;
  premiereDate: Date;
  description: string;
  children?: React.ReactNode;
}

const PremierePage = ({ title, emoji, premiereDate, description, children }: PremierePageProps) => {
  const { isAdmin, subscribedEmail, setSubscribedEmail } = useSite();
  const [emailInput, setEmailInput] = useState("");
  const [backupEmail, setBackupEmail] = useState("");
  const [showBackup, setShowBackup] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const now = new Date();
  const isLive = now >= premiereDate;

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
            <p className="text-muted-foreground font-script text-xl mb-4">{description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Premieres: {formatDate(premiereDate)}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${isLive ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
                {isLive ? "LIVE" : "Scheduled"}
              </span>
            </div>
          </div>
          <div className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-display text-foreground mb-4">Admin Panel</h2>
            <p className="text-muted-foreground mb-4">This section will be editable when the page goes live. You can add images, text, and more here.</p>
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center text-muted-foreground">
              <p className="text-lg">📸 Drop content here when ready</p>
              <p className="text-sm mt-2">Images, stories, and memories will go here</p>
            </div>
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
          <p className="text-muted-foreground font-script text-xl mb-6">{description}</p>
          
          <div className="flex items-center justify-center gap-2 mb-8 text-primary">
            <Lock className="w-5 h-5" />
            <span className="font-display text-lg">Premieres {formatDate(premiereDate)}</span>
          </div>

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

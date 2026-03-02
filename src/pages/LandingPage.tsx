import photo1 from "@/assets/photo1.jpg";
import photo2 from "@/assets/photo2.jpg";
import photo3 from "@/assets/photo3.jpg";
import photo4 from "@/assets/photo4.jpg";
import photo5 from "@/assets/photo5.jpg";
import photo6 from "@/assets/photo6.jpg";
import photo7 from "@/assets/photo7.jpg";
import photo8 from "@/assets/photo8.jpg";
import photo9 from "@/assets/photo9.jpg";
import FloatingElements from "@/components/FloatingElements";
import { Heart, Lock, Mail } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import { useState } from "react";

const photos = [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8, photo9];

const specialDates = [
  { date: "November 2023", title: "Where It All Began", description: "The moment everything changed forever.", unlocked: true },
  { date: "February 2024", title: "A Day To Remember", description: "Coming soon...", unlocked: false },
  { date: "May 2024", title: "Growing Together", description: "Coming soon...", unlocked: false },
  { date: "August 2024", title: "Summer of Us", description: "Coming soon...", unlocked: false },
  { date: "December 2024", title: "End of Year Magic", description: "Coming soon...", unlocked: false },
];

const LandingPage = () => {
  const { subscribedEmail, setSubscribedEmail } = useSite();
  const [emailInput, setEmailInput] = useState("");

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribedEmail(emailInput.trim());
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 relative">
      <FloatingElements />

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-12 pb-16 text-center">
        <div className="animate-fade-in-up">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-heartbeat" />
          <h1 className="text-5xl md:text-7xl font-display gradient-text mb-4 leading-tight">
            The Prettiest<br />Queen Alive
          </h1>
          <p className="font-script text-2xl md:text-3xl text-accent max-w-xl mx-auto mb-3">
            A love letter written in pixels and light
          </p>
          <p className="text-muted-foreground font-body max-w-md mx-auto leading-relaxed">
            Every photo holds a thousand words I never said, every page a chapter of us.
            This is your world — built for you, because you deserve more than the ordinary.
          </p>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="break-inside-avoid photo-frame rounded-xl overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <img
                src={photo}
                alt={`Beautiful moment ${i + 1}`}
                className="w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Special Dates Section */}
      <section className="relative z-10 max-w-3xl mx-auto px-4 mt-20">
        <h2 className="text-3xl md:text-4xl font-display gradient-text text-center mb-12">
          Special Dates
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-accent/40 to-border/20" />

          <div className="space-y-8">
            {specialDates.map((item, i) => (
              <div key={i} className="relative pl-16 animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                {/* Dot */}
                <div className={`absolute left-4 top-2 w-5 h-5 rounded-full border-2 ${
                  item.unlocked
                    ? "bg-primary border-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]"
                    : "bg-muted border-border"
                }`} />

                <div className={`glass-card rounded-xl p-6 transition-all ${
                  item.unlocked ? "border-primary/20" : "opacity-70"
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-body text-primary tracking-wider uppercase">{item.date}</span>
                    {!item.unlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <h3 className="font-display text-xl text-foreground mb-1">
                    {item.unlocked ? item.title : "🔒 Locked"}
                  </h3>
                  {item.unlocked ? (
                    <p className="text-muted-foreground font-body text-sm">{item.description}</p>
                  ) : (
                    <div className="mt-2">
                      {subscribedEmail ? (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-primary" />
                          You'll be notified by email when unlocked
                        </p>
                      ) : (
                        <form onSubmit={handleEmailSubmit} className="flex gap-2">
                          <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="Email for notification..."
                            required
                            className="flex-1 px-3 py-1.5 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 font-body"
                          />
                          <button type="submit" className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-body hover:opacity-90 transition-opacity">
                            Notify Me
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom caption */}
      <section className="relative z-10 text-center mt-16 px-4">
        <div className="glass-card rounded-2xl max-w-lg mx-auto p-8 animate-fade-in-up" style={{ animationDelay: "1.5s" }}>
          <p className="font-script text-2xl text-foreground mb-2">
            "You are the poem I never knew how to write,
          </p>
          <p className="font-script text-2xl text-foreground">
            and the story I'll never stop telling."
          </p>
          <div className="mt-6 text-primary font-display text-sm tracking-wide">
            Mr.Mwendwa — always yours ❤️💍
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

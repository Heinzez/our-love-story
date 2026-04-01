import { useState, useMemo } from "react";
import { useSite } from "@/context/SiteContext";
import { ArrowRight, Heart, Sparkles } from "lucide-react";
import photo1 from "@/assets/photo1.jpg";
import photo3 from "@/assets/photo3.jpg";
import photo5 from "@/assets/photo5.jpg";
import photo10 from "@/assets/photo10.jpg";

const orbitPhotos = [photo1, photo3, photo5, photo10];

const AccessGate = () => {
  const { setIsAdmin, setIsAuthenticated } = useSite();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const normalized = answer.trim().toLowerCase();

    setTimeout(() => {
      if (normalized === "shyness") {
        setIsAdmin(false);
        setIsAuthenticated(true);
      } else if (normalized === "your ability to lie") {
        setIsAdmin(true);
        setIsAuthenticated(true);
      } else {
        setError("Incorrect answer. Please try again.");
        setIsSubmitting(false);
      }
    }, 400);
  };

  // Memoize orbit items so they don't re-render on typing
  const orbitItems = useMemo(() => orbitPhotos.map((src, i) => ({
    src,
    delay: `${i * -5}s`,
    radius: 160 + i * 15,
    size: 44 + i * 4,
    duration: `${20 + i * 3}s`,
  })), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px]" />
      </div>

      {/* Floating petals */}
      {[0, 1, 2, 3, 4].map(i => (
        <div
          key={i}
          className="absolute animate-petal text-lg opacity-20 pointer-events-none"
          style={{
            left: `${15 + i * 18}%`,
            animationDuration: `${12 + i * 1.5}s`,
            animationDelay: `${i * 1.2}s`,
          }}
        >
          {["🌸", "🌺", "🌹", "💐", "🪷"][i]}
        </div>
      ))}

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Orbiting photos — memoized, won't re-render on input */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {orbitItems.map((item, i) => (
            <div
              key={i}
              className="absolute rounded-full overflow-hidden border border-gold/20 shadow-lg opacity-40"
              style={{
                width: item.size,
                height: item.size,
                animation: `orbit ${item.duration} linear infinite`,
                animationDelay: item.delay,
                ["--orbit-radius" as string]: `${item.radius}px`,
              }}
            >
              <img src={item.src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="glass-card rounded-2xl shadow-2xl overflow-hidden relative"
          style={{ animation: "glowSnake 4s ease-in-out infinite" }}
        >
          <div className="px-8 py-10 md:px-12 md:py-14">
            <div className="flex flex-col items-center mb-8">
              <Heart
                className="w-12 h-12 text-primary mb-5 animate-heartbeat"
                fill="hsl(var(--primary))"
                strokeWidth={0}
              />
              <h1 className="text-3xl md:text-4xl font-display gradient-text mb-2 text-center tracking-tight">
                Welcome, My Queen
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <p className="text-muted-foreground text-sm font-body">
                  Answer to enter your world
                </p>
                <Sparkles className="w-3.5 h-3.5 text-gold" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="answer" className="block text-sm font-body text-foreground/80 mb-3">
                  What about you do I laugh about with you a lot?
                </label>
                <input
                  id="answer"
                  type="text"
                  value={answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your answer"
                  disabled={isSubmitting}
                  className={`w-full px-4 py-3.5 rounded-xl bg-muted/40 border border-border/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all duration-200 disabled:opacity-50 text-base font-body ${
                    error ? "animate-shake" : ""
                  }`}
                  autoComplete="off"
                />
                {error && (
                  <p className="text-accent text-sm mt-2 font-body animate-fade-in-up">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !answer.trim()}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent/90 text-primary-foreground font-display text-base tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-5 border-t border-border/30 text-center">
              <p className="text-xs text-muted-foreground/60 font-body tracking-wide">
                A private space — built with love
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;

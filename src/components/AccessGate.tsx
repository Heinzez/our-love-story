import { useState, useMemo } from "react";
import { useSite } from "@/context/SiteContext";
import { Heart, Sparkles } from "lucide-react";
import photo1 from "@/assets/photo1.jpg";
import photo3 from "@/assets/photo3.jpg";
import photo5 from "@/assets/photo5.jpg";
import photo10 from "@/assets/photo10.jpg";

const orbitPhotos = [photo1, photo3, photo5, photo10];

const petals = Array.from({ length: 10 }).map((_, i) => ({
  emoji: ["🌸", "🌺", "✨", "💫", "🪷"][i % 5],
  left: `${i * 10 + Math.random() * 5}%`,
  duration: `${9 + i * 0.8}s`,
  delay: `${i * 0.7}s`,
}));

const AccessGate = () => {
  const { setIsAdmin, setIsAuthenticated } = useSite();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = answer.trim().toLowerCase();

    if (normalized === "shyness") {
      setIsAdmin(false);
      setIsAuthenticated(true);
    } else if (normalized === "your ability to lie") {
      setIsAdmin(true);
      setIsAuthenticated(true);
    } else {
      setError("That's not quite right... try again 💕");
      setShaking(true);
      setTimeout(() => setShaking(false), 600);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Radial glow behind center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(18 85% 60% / 0.08) 0%, transparent 70%)",
        }}
      />

      {/* Orbiting photos */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {orbitPhotos.map((photo, i) => (
          <div
            key={i}
            className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg opacity-40"
            style={{
              animation: `orbit ${18 + i * 3}s linear infinite`,
              animationDelay: `${i * -4.5}s`,
              transformOrigin: `${120 + i * 20}px`,
            }}
          >
            <img src={photo} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Floating petals */}
      {petals.map((petal, i) => (
        <div
          key={i}
          className="absolute text-xl animate-petal pointer-events-none opacity-30"
          style={{
            left: petal.left,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
          }}
        >
          {petal.emoji}
        </div>
      ))}

      {/* Main card */}
      <div
        className={`relative z-10 glass-card rounded-3xl p-8 md:p-12 max-w-md w-full mx-4 text-center transition-all duration-500 ${
          shaking ? "animate-shake" : ""
        }`}
        style={{
          ...(shaking ? { animation: "shake 0.5s ease-in-out" } : {}),
          boxShadow: focused
            ? "0 0 60px hsl(18 85% 60% / 0.15), 0 20px 60px hsl(230 25% 8% / 0.5)"
            : "0 20px 60px hsl(230 25% 8% / 0.5)",
        }}
      >
        {/* Decorative top sparkle */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Sparkles className="w-6 h-6 text-gold animate-float" />
        </div>

        {/* Heart with glow ring */}
        <div className="relative mx-auto mb-6 w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-glow" />
          <Heart className="w-10 h-10 text-primary animate-heartbeat relative z-10" />
        </div>

        <h1 className="text-3xl md:text-4xl font-display gradient-text mb-2 leading-tight">
          Before You Enter...
        </h1>
        <p className="text-muted-foreground font-script text-xl mb-8">
          Answer this to unlock something special
        </p>

        {/* Question card */}
        <div className="mb-8 p-5 rounded-2xl bg-muted/20 border border-border/30 relative overflow-hidden">
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <p className="text-foreground text-lg font-display leading-relaxed relative z-10">
            "What about you do I laugh about with you a lot?"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                setError("");
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Type your answer..."
              className="w-full px-6 py-4 rounded-2xl bg-input/80 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 text-center text-lg font-body transition-all duration-300"
            />
          </div>

          {error && (
            <p className="text-accent text-sm animate-fade-in-up font-body">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display text-lg tracking-wide hover:brightness-110 transition-all duration-300 shadow-[0_4px_20px_hsl(18_85%_60%_/_0.3)] hover:shadow-[0_6px_30px_hsl(18_85%_60%_/_0.5)] active:scale-[0.98]"
          >
            Unlock ✨
          </button>
        </form>

        <p className="mt-6 text-muted-foreground font-script text-lg">
          Only the heart knows the answer...
        </p>

        {/* Bottom decorative line */}
        <div className="mt-6 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
    </div>
  );
};

export default AccessGate;

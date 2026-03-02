import { useState } from "react";
import { useSite } from "@/context/SiteContext";
import { Heart } from "lucide-react";

const AccessGate = () => {
  const { setIsAdmin, setIsAuthenticated } = useSite();
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

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
      {/* Floating petals background */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-petal pointer-events-none opacity-40"
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 6}s`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        >
          🌸
        </div>
      ))}

      <div className={`glass-card rounded-2xl p-10 max-w-lg w-full mx-4 text-center ${shaking ? "animate-shake" : ""}`}
        style={shaking ? { animation: "shake 0.5s ease-in-out" } : {}}>
        <div className="mb-6">
          <Heart className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse-glow rounded-full" />
          <h1 className="text-3xl font-display gradient-text mb-2">Before You Enter...</h1>
          <p className="text-muted-foreground font-script text-xl">Answer this to unlock something special</p>
        </div>

        <div className="mb-8 p-6 rounded-xl bg-muted/30">
          <p className="text-foreground text-lg font-display leading-relaxed">
            "What about you do I laugh about with you a lot?"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); setError(""); }}
            placeholder="Type your answer..."
            className="w-full px-6 py-4 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-lg font-body transition-all"
          />
          {error && <p className="text-accent text-sm animate-fade-in-up">{error}</p>}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-display text-lg tracking-wide hover:opacity-90 transition-all animate-pulse-glow"
          >
            Unlock ✨
          </button>
        </form>

        <p className="mt-6 text-muted-foreground text-sm font-script text-lg">
          Only the heart knows the answer...
        </p>
      </div>
    </div>
  );
};

export default AccessGate;

import { useState } from "react";
import { useSite } from "@/context/SiteContext";
import { Lock, ArrowRight, CircleAlert as AlertCircle } from "lucide-react";

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />

      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-pink-500/20 blur-2xl animate-pulse" style={{ animation: "glowSnake 4s ease-in-out infinite" }} />
        <div className="glass-card rounded-2xl shadow-2xl overflow-hidden border border-border/50 relative" style={{
          boxShadow: "0 0 30px rgba(236, 72, 153, 0.3), 0 20px 60px rgba(0, 0, 0, 0.3)"
        }}>
          <div className="px-8 py-10 md:px-12 md:py-14">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent/80 flex items-center justify-center mb-6 shadow-lg">
                <Lock className="w-8 h-8 text-primary-foreground" strokeWidth={2.5} />
              </div>

              <h1 className="text-3xl md:text-4xl font-display text-foreground mb-3 text-center tracking-tight">
                Access Required
              </h1>
              <p className="text-muted-foreground text-center text-base">
                Please answer the security question to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="answer" className="block text-sm font-medium text-foreground/90 mb-3">
                  What about you do I laugh about with you a lot?
                </label>
                <div className="relative">
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
                    className="w-full px-4 py-3.5 rounded-xl bg-muted/50 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-accent text-sm mt-2 animate-fade-in-up">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !answer.trim()}
                className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent/90 text-primary-foreground font-medium text-base tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-2 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40">
              <p className="text-xs text-muted-foreground text-center leading-relaxed">
                This is a private space. Only authorized access is permitted.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground/60">
            Secured and encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessGate;

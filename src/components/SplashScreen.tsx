import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<"heart" | "text" | "fade">("heart");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("text"), 800);
    const t2 = setTimeout(() => setPhase("fade"), 2600);
    const t3 = setTimeout(onComplete, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[80px]" />
      </div>

      {/* Heart */}
      <div
        className={`relative z-10 transition-all duration-700 ease-out ${
          phase === "heart" ? "scale-100 opacity-100" : "scale-90 opacity-100"
        }`}
      >
        <Heart
          className="w-16 h-16 text-primary animate-heartbeat"
          fill="hsl(var(--primary))"
          strokeWidth={0}
        />
      </div>

      {/* Title text */}
      <div
        className={`relative z-10 mt-8 text-center transition-all duration-700 ease-out ${
          phase === "heart" ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        }`}
      >
        <h1 className="text-4xl md:text-5xl font-display gradient-text tracking-tight">
          For My Queen
        </h1>
        <p className="mt-3 font-script text-xl text-accent/80">
          A love letter in light
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <div className="w-8 h-px bg-primary/40" />
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-body">
            Mr.Mwendwa
          </span>
          <div className="w-8 h-px bg-primary/40" />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

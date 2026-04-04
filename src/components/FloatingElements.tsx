import { useMemo } from "react";

const FloatingElements = () => {
  // Fireflies: scattered across screen, glow + fade in/out with gentle drift
  const fireflies = useMemo(() =>
    Array.from({ length: 38 }).map((_, i) => ({
      left: `${(i * 2.73 + 1.5) % 98}%`,
      top:  `${(i * 3.91 + 5) % 88}%`,
      size: 2 + (i % 4),
      hue:  328 + (i % 5) * 9,
      variant: i % 6,
      duration: `${7 + (i % 8) * 1.4}s`,
      delay:    `${(i * 0.55) % 9}s`,
    })), []);

  // Large bokeh rings: very faint, blurred, slowly breathing
  const bokeh = useMemo(() =>
    Array.from({ length: 9 }).map((_, i) => ({
      left:     `${(i * 11.3 + 4) % 94}%`,
      top:      `${(i * 14.7 + 6) % 82}%`,
      size:     70 + i * 18,
      opacity:  0.028 + (i % 3) * 0.012,
      hue:      330 + (i % 4) * 11,
      duration: `${18 + i * 2.5}s`,
      delay:    `${i * 1.9}s`,
    })), []);

  // Shooting star streaks
  const streaks = useMemo(() =>
    Array.from({ length: 4 }).map((_, i) => ({
      top:      `${8 + i * 22}%`,
      duration: `${5 + i * 1.8}s`,
      delay:    `${i * 4.5 + 2}s`,
      hue:      338 + i * 7,
      opacity:  0.12 + i * 0.03,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">

      {/* Bokeh circles — large blurred glows scattered across page */}
      {bokeh.map((b, i) => (
        <div
          key={`bk-${i}`}
          className="absolute rounded-full animate-bokeh-breathe"
          style={{
            left: b.left, top: b.top,
            width: b.size, height: b.size,
            opacity: b.opacity,
            background: `radial-gradient(circle at 40% 40%, hsl(${b.hue} 85% 70%), hsl(${b.hue} 60% 50%) 55%, transparent 80%)`,
            filter: `blur(${b.size * 0.35}px)`,
            animationDuration: b.duration,
            animationDelay:    b.delay,
          }}
        />
      ))}

      {/* Fireflies — fixed positions, fade & drift gently */}
      {fireflies.map((f, i) => (
        <div
          key={`ff-${i}`}
          className={`absolute rounded-full animate-firefly-${f.variant}`}
          style={{
            left: f.left, top: f.top,
            width: f.size, height: f.size,
            background: `radial-gradient(circle, hsl(${f.hue} 95% 82%) 30%, hsl(${f.hue} 70% 62%) 65%, transparent)`,
            boxShadow: `0 0 ${f.size * 5}px 1px hsl(${f.hue} 80% 68% / 0.55)`,
            animationDuration: f.duration,
            animationDelay:    f.delay,
          }}
        />
      ))}

      {/* Shooting stars */}
      {streaks.map((s, i) => (
        <div
          key={`ss-${i}`}
          className="absolute animate-shooting-star"
          style={{
            top: s.top,
            left: "-10%",
            width: "120px",
            height: "1px",
            opacity: s.opacity,
            background: `linear-gradient(90deg, transparent, hsl(${s.hue} 90% 75%), transparent)`,
            animationDuration: s.duration,
            animationDelay:    s.delay,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingElements;

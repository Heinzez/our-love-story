import { useMemo } from "react";
import photo1 from "@/assets/photo1.jpg";
import photo3 from "@/assets/photo3.jpg";
import photo5 from "@/assets/photo5.jpg";
import photo10 from "@/assets/photo10.jpg";
import photo16 from "@/assets/photo16.jpg";

const bubblePhotoSrcs = [photo1, photo3, photo5, photo10, photo16];

const FloatingElements = () => {
  const bubblePhotos = useMemo(() => {
    return bubblePhotoSrcs.map((src, i) => ({
      src,
      left: `${10 + (i * 20)}%`,
      duration: `${12 + i * 1.5}s`,
      delay: `${i * 2.5}s`,
      size: 50 + i * 6,
    }));
  }, []);

  const petals = useMemo(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      emoji: ["🌸", "🌺", "🌹", "💐", "🪷"][i % 5],
      left: `${(i * 8.3)}%`,
      duration: `${10 + i * 0.7}s`,
      delay: `${i * 0.7}s`,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bubblePhotos.map((bubble, i) => (
        <div
          key={`bubble-${i}`}
          className="absolute animate-bubble rounded-full overflow-hidden border-2 border-primary/20 shadow-lg"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDuration: bubble.duration,
            animationDelay: bubble.delay,
            bottom: "-80px",
          }}
        >
          <img src={bubble.src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {petals.map((petal, i) => (
        <div
          key={`petal-${i}`}
          className="absolute animate-petal text-xl opacity-30"
          style={{
            left: petal.left,
            animationDuration: petal.duration,
            animationDelay: petal.delay,
          }}
        >
          {petal.emoji}
        </div>
      ))}
    </div>
  );
};

export default FloatingElements;

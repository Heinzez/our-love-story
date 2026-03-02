import { useMemo } from "react";

const FloatingElements = () => {
  const bubblePhotos = useMemo(() => {
    const photos = [
      "/src/assets/photo1.jpg", "/src/assets/photo3.jpg", "/src/assets/photo5.jpg",
      "/src/assets/photo6.jpg", "/src/assets/photo8.jpg",
    ];
    return photos.map((src, i) => ({
      src,
      left: `${10 + (i * 20)}%`,
      duration: `${12 + Math.random() * 8}s`,
      delay: `${i * 2.5}s`,
      size: 50 + Math.random() * 30,
    }));
  }, []);

  const petals = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      emoji: ["🌸", "🌺", "🌹", "💐", "🪷"][i % 5],
      left: `${Math.random() * 100}%`,
      duration: `${10 + Math.random() * 8}s`,
      delay: `${Math.random() * 8}s`,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating bubble photos */}
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

      {/* Falling petals */}
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

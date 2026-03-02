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
import { Heart } from "lucide-react";

const photos = [photo1, photo2, photo3, photo4, photo5, photo6, photo7, photo8, photo9];

const LandingPage = () => {
  return (
    <div className="min-h-screen pt-20 pb-16 relative">
      <FloatingElements />

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-12 pb-16 text-center">
        <div className="animate-fade-in-up">
          <Heart className="w-10 h-10 text-primary mx-auto mb-4 animate-pulse-glow rounded-full" />
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

      {/* Bottom caption */}
      <section className="relative z-10 text-center mt-16 px-4">
        <div className="glass-card rounded-2xl max-w-lg mx-auto p-8 animate-fade-in-up" style={{ animationDelay: "1.5s" }}>
          <p className="font-script text-2xl text-foreground mb-2">
            "You are the poem I never knew how to write,
          </p>
          <p className="font-script text-2xl text-foreground">
            and the story I'll never stop telling."
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-primary">
            <span className="text-sm">— Forever yours</span>
            <Heart className="w-4 h-4" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

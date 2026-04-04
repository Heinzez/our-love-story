import { useSite } from "@/context/SiteContext";
import PremierePage from "@/components/PremierePage";
import { Heart, Sparkles, Star } from "lucide-react";

const chapters = [
  {
    month: "November 2023",
    title: "The Beginning",
    body: "It started quietly — the way the best things always do. Two people, one moment, and something that felt like it had always been there. The world felt a little brighter from that day forward.",
    accent: "hsl(338 80% 62%)",
  },
  {
    month: "December 2023",
    title: "Getting To Know You",
    body: "Long calls that stretched past midnight. Learning your laugh, your silences, the way you say things. Every conversation left me wanting more. I knew I was in trouble — the good kind.",
    accent: "hsl(355 70% 65%)",
  },
  {
    month: "Early 2024",
    title: "Falling, Freely",
    body: "There was no single moment — it was a thousand small ones. The way you smile when you think no one's watching. The warmth you carry without even knowing it. I fell, and I didn't mind at all.",
    accent: "hsl(338 80% 62%)",
  },
  {
    month: "Mid 2024",
    title: "Through The Hard Parts",
    body: "No story worth telling is without its difficult pages. We had ours. But what I learned is that you're someone worth choosing again and again — even on the days that ask the most of us.",
    accent: "hsl(315 45% 58%)",
  },
  {
    month: "Late 2024",
    title: "Choosing Each Other",
    body: "Some people come into your life and change the shape of it. You are that person for me. Every day I choose you — not because I have to, but because there is no version of a good life that doesn't have you in it.",
    accent: "hsl(338 80% 62%)",
  },
  {
    month: "2025 & Beyond",
    title: "What We're Building",
    body: "This is where the story gets interesting. Not an ending — a deepening. More mornings, more adventures, more of your laughter filling up every room. We're just getting started, and I can't wait.",
    accent: "hsl(38 65% 58%)",
  },
];

const OurStoryPage = () => {
  const { isAdmin } = useSite();
  if (!isAdmin) return (
    <PremierePage
      title="Our Story"
      emoji="📖"
      premiereDate={new Date("2026-08-14")}
      description="The tale of how two hearts collided and never looked back."
    />
  );
  return (
  <div className="min-h-screen pt-24 pb-20 px-4">
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(338 80% 62% / 0.4))" }} />
          <Heart className="w-5 h-5 text-primary" fill="currentColor" />
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(338 80% 62% / 0.4), transparent)" }} />
        </div>
        <h1 className="text-4xl font-display gradient-text mb-3">Our Story</h1>
        <p className="text-muted-foreground font-body text-base leading-relaxed max-w-md mx-auto" style={{ fontStyle: "italic" }}>
          The tale of how two hearts collided and never looked back.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, transparent, hsl(338 80% 62% / 0.25) 10%, hsl(338 80% 62% / 0.25) 90%, transparent)" }} />

        <div className="space-y-10">
          {chapters.map((chapter, i) => (
            <div key={i} className="relative flex gap-8 pl-14">
              {/* Dot */}
              <div className="absolute left-[18px] top-1 w-4 h-4 rounded-full border-2 shrink-0 -translate-x-1/2"
                style={{ background: "hsl(340 18% 7%)", borderColor: chapter.accent, boxShadow: `0 0 10px ${chapter.accent}60` }} />

              {/* Card */}
              <div className="flex-1 rounded-2xl p-6 group hover:scale-[1.01] transition-transform duration-300"
                style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.1)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[11px] font-body tracking-widest uppercase" style={{ color: chapter.accent }}>
                    {chapter.month}
                  </span>
                </div>
                <h3 className="text-xl font-display text-foreground mb-3">{chapter.title}</h3>
                <p className="text-muted-foreground font-body text-sm leading-relaxed">{chapter.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer quote */}
      <div className="text-center mt-20">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="w-3 h-3 text-primary/40" fill="currentColor" />
          <Star className="w-4 h-4 text-primary/60" fill="currentColor" />
          <Star className="w-3 h-3 text-primary/40" fill="currentColor" />
        </div>
        <p className="font-display text-xl gradient-text mb-2" style={{ fontStyle: "italic" }}>
          "And still, it keeps getting better."
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Sparkles className="w-4 h-4 text-primary/50" />
          <span className="text-primary/60 font-display text-sm tracking-wide">Mr.Mwendwa — always yours ❤️</span>
          <Sparkles className="w-4 h-4 text-primary/50" />
        </div>
      </div>

    </div>
  </div>
  );
};

export default OurStoryPage;

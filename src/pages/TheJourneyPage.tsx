import { useSite } from "@/context/SiteContext";
import PremierePage from "@/components/PremierePage";
import { MapPin, Compass, Heart } from "lucide-react";

const milestones = [
  {
    icon: "✦",
    label: "First message sent",
    description: "The one that changed everything. Three words or a whole paragraph — it doesn't matter. What matters is that it landed.",
    color: "hsl(338 80% 62%)",
  },
  {
    icon: "✦",
    label: "First time I heard your laugh",
    description: "Real laughter. The kind you can't fake. I knew right then that I wanted to be the reason for it as often as possible.",
    color: "hsl(355 70% 65%)",
  },
  {
    icon: "✦",
    label: "The first late-night conversation",
    description: "Time stopped making sense. We talked until the sky changed color and neither of us wanted to hang up first.",
    color: "hsl(315 45% 58%)",
  },
  {
    icon: "✦",
    label: "When I realized I was falling",
    description: "There was no dramatic announcement. Just a quiet, certain knowing — that you were becoming my favorite person.",
    color: "hsl(338 80% 62%)",
  },
  {
    icon: "✦",
    label: "The first time I said it out loud",
    description: "Three words that felt enormous and obvious at the same time. You already knew. You always seem to know.",
    color: "hsl(38 65% 58%)",
  },
  {
    icon: "✦",
    label: "The moments in between",
    description: "Not the milestones — the ordinary days. The check-ins. The shared music. The inside jokes that need no explanation.",
    color: "hsl(338 80% 62%)",
  },
  {
    icon: "✦",
    label: "Right now",
    description: "This moment. You, reading this. Me, thinking of you. Still here, still grateful, still choosing you every single day.",
    color: "hsl(355 70% 65%)",
  },
];

const TheJourneyPage = () => {
  const { isAdmin } = useSite();
  if (!isAdmin) return (
    <PremierePage
      title="The Journey"
      emoji="🗺️"
      premiereDate={new Date("2026-09-05")}
      description="Every step, every mile, every moment that led us here."
    />
  );
  return (
  <div className="min-h-screen pt-24 pb-20 px-4">
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(338 80% 62% / 0.4))" }} />
          <Compass className="w-5 h-5 text-primary" />
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(338 80% 62% / 0.4), transparent)" }} />
        </div>
        <h1 className="text-4xl font-display gradient-text mb-3">The Journey</h1>
        <p className="text-muted-foreground font-body text-base leading-relaxed max-w-md mx-auto" style={{ fontStyle: "italic" }}>
          Every step, every milestone, every moment that led us here.
        </p>
      </div>

      {/* Path */}
      <div className="space-y-6">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="group flex gap-5 items-start rounded-2xl p-6 transition-all duration-300 hover:scale-[1.01]"
            style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.1)" }}
          >
            {/* Step marker */}
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display text-base transition-all duration-300"
                style={{ background: `${m.color}15`, border: `1px solid ${m.color}35`, color: m.color }}>
                {i + 1}
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3 h-3 shrink-0" style={{ color: m.color }} />
                <h3 className="font-display text-base text-foreground">{m.label}</h3>
              </div>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">{m.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-16 py-10 rounded-2xl"
        style={{ background: "hsl(338 80% 62% / 0.04)", border: "1px solid hsl(338 80% 62% / 0.12)" }}>
        <Heart className="w-8 h-8 text-primary mx-auto mb-4 animate-heartbeat" fill="currentColor" />
        <p className="font-display text-xl gradient-text mb-2" style={{ fontStyle: "italic" }}>
          "The journey isn't over — it's only getting more beautiful."
        </p>
        <p className="text-primary/50 font-display text-sm tracking-wide mt-4">Mr.Mwendwa — always yours ❤️</p>
      </div>

    </div>
  </div>
  );
};

export default TheJourneyPage;

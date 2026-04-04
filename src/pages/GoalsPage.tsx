import { useSite } from "@/context/SiteContext";
import PremierePage from "@/components/PremierePage";
import { Sparkles, Star, Heart, Check } from "lucide-react";

const categories = [
  {
    title: "Us & Our Relationship",
    color: "hsl(338 80% 62%)",
    goals: [
      { text: "Build a foundation of trust that weathers every season", done: true },
      { text: "Keep choosing each other — intentionally, daily", done: true },
      { text: "Learn how to love each other better, always", done: false },
      { text: "Create a life that feels like home", done: false },
      { text: "Grow old together — still laughing", done: false },
    ],
  },
  {
    title: "Adventures Together",
    color: "hsl(355 70% 65%)",
    goals: [
      { text: "Visit places we've only talked about", done: false },
      { text: "Have a trip that goes hilariously wrong and becomes our best story", done: false },
      { text: "Find our favorite restaurant in a new city", done: false },
      { text: "Watch a sunrise together from somewhere beautiful", done: false },
    ],
  },
  {
    title: "Growth",
    color: "hsl(38 65% 58%)",
    goals: [
      { text: "Celebrate every version of you — past, present, future", done: true },
      { text: "Be the person you deserve me to be", done: false },
      { text: "Build financial stability so we can live freely", done: false },
      { text: "Support each other's individual dreams fiercely", done: false },
    ],
  },
  {
    title: "The Small Beautiful Things",
    color: "hsl(315 45% 58%)",
    goals: [
      { text: "Have a song that's completely ours", done: true },
      { text: "Build traditions that are only ours", done: false },
      { text: "Cook a meal together that actually turns out well", done: false },
      { text: "Never stop leaving love notes", done: false },
    ],
  },
];

const GoalsPage = () => {
  const { isAdmin } = useSite();
  if (!isAdmin) return (
    <PremierePage
      title="Goals & Dreams"
      emoji="⭐"
      premiereDate={new Date("2026-11-20")}
      description="Everything we dreamed of, everything we became."
    />
  );
  return (
  <div className="min-h-screen pt-24 pb-20 px-4">
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(338 80% 62% / 0.4))" }} />
          <Sparkles className="w-5 h-5 text-primary" />
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(338 80% 62% / 0.4), transparent)" }} />
        </div>
        <h1 className="text-4xl font-display gradient-text mb-3">Goals & Dreams</h1>
        <p className="text-muted-foreground font-body text-base leading-relaxed max-w-md mx-auto" style={{ fontStyle: "italic" }}>
          Everything we dreamed of, everything we became — and everything still ahead.
        </p>
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {categories.map((cat, ci) => (
          <div key={ci} className="rounded-2xl overflow-hidden"
            style={{ background: "hsl(0 0% 100% / 0.025)", border: `1px solid ${cat.color}20` }}>

            {/* Category header */}
            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${cat.color}15` }}>
              <Star className="w-4 h-4 shrink-0" style={{ color: cat.color }} fill="currentColor" />
              <h3 className="font-display text-base" style={{ color: cat.color }}>{cat.title}</h3>
            </div>

            {/* Goals list */}
            <div className="px-6 py-4 space-y-3">
              {cat.goals.map((goal, gi) => (
                <div key={gi} className="flex items-start gap-3 group">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={goal.done
                      ? { background: `${cat.color}20`, border: `1px solid ${cat.color}50` }
                      : { background: "hsl(0 0% 100% / 0.04)", border: "1px solid hsl(338 80% 62% / 0.15)" }}>
                    {goal.done && <Check className="w-3 h-3" style={{ color: cat.color }} />}
                  </div>
                  <p className="font-body text-sm leading-relaxed"
                    style={{ color: goal.done ? "hsl(30 20% 80%)" : "hsl(30 10% 52%)" }}>
                    {goal.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quote */}
      <div className="text-center mt-16 py-10 rounded-2xl"
        style={{ background: "hsl(338 80% 62% / 0.04)", border: "1px solid hsl(338 80% 62% / 0.12)" }}>
        <Heart className="w-8 h-8 text-primary mx-auto mb-4" fill="currentColor" />
        <p className="font-display text-xl gradient-text mb-2" style={{ fontStyle: "italic" }}>
          "Every dream is bigger with you in it."
        </p>
        <p className="text-primary/50 font-display text-sm tracking-wide mt-4">Mr.Mwendwa — always yours ❤️</p>
      </div>

    </div>
  </div>
  );
};

export default GoalsPage;

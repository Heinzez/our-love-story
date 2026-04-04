import { useSite } from "@/context/SiteContext";
import PremierePage from "@/components/PremierePage";
import { Smile, Heart } from "lucide-react";

const moments = [
  {
    title: "The Autocorrect Disasters",
    body: "Some of the things autocorrect turned your messages into could have genuinely started an argument — if we hadn't both collapsed laughing first.",
    tag: "texts",
  },
  {
    title: "When You Try To Be Serious",
    body: "You'll be mid-sentence, making a very valid point — and then you'll crack yourself up. Every. Single. Time. I love that you can never quite hold it together.",
    tag: "everyday",
  },
  {
    title: "The Things That Only Make Sense To Us",
    body: "Certain words. Certain looks. References that would mean absolutely nothing to anyone else but send us both completely over the edge. That's our language.",
    tag: "inside jokes",
  },
  {
    title: "Your Expressions",
    body: "The face you make when something surprises you. The one you make when you're pretending not to find something funny but clearly do. I could write a whole book just about your faces.",
    tag: "you",
  },
  {
    title: "When Plans Completely Fall Apart",
    body: "Something goes wrong, everything changes, and instead of stressing, we just find the absurdity in it and laugh our way through. That's one of my favorite things about us.",
    tag: "adventures",
  },
  {
    title: "Your Humor At The Worst Moments",
    body: "Somehow you always find the one angle on a bad situation that makes it funny. That's a gift, and I am very lucky to be the recipient of it.",
    tag: "perspective",
  },
  {
    title: "The Laugh Itself",
    body: "The real one. Unguarded. The one that takes over your whole face and makes your shoulders shake. When I make you laugh like that — genuinely — it's honestly one of the best feelings I know.",
    tag: "favorite",
  },
];

const tagColors: Record<string, string> = {
  texts: "hsl(355 70% 65%)",
  everyday: "hsl(338 80% 62%)",
  "inside jokes": "hsl(315 45% 58%)",
  you: "hsl(38 65% 58%)",
  adventures: "hsl(338 80% 62%)",
  perspective: "hsl(355 70% 65%)",
  favorite: "hsl(338 80% 62%)",
};

const LaughsPage = () => {
  const { isAdmin } = useSite();
  if (!isAdmin) return (
    <PremierePage
      title="Laughs"
      emoji="😂"
      premiereDate={new Date("2026-10-01")}
      description="The moments that made us cry from laughing too hard."
    />
  );
  return (
  <div className="min-h-screen pt-24 pb-20 px-4">
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(338 80% 62% / 0.4))" }} />
          <Smile className="w-5 h-5 text-primary" />
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(338 80% 62% / 0.4), transparent)" }} />
        </div>
        <h1 className="text-4xl font-display gradient-text mb-3">Laughs</h1>
        <p className="text-muted-foreground font-body text-base leading-relaxed max-w-md mx-auto" style={{ fontStyle: "italic" }}>
          The moments that made us cry from laughing too hard.
        </p>
      </div>

      {/* Grid of cards */}
      <div className="columns-1 sm:columns-2 gap-4 space-y-4">
        {moments.map((m, i) => (
          <div
            key={i}
            className="break-inside-avoid rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
            style={{ background: "hsl(0 0% 100% / 0.03)", border: "1px solid hsl(338 80% 62% / 0.1)" }}
          >
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-body tracking-widest uppercase mb-3"
              style={{ background: `${tagColors[m.tag] || "hsl(338 80% 62%)"}18`, color: tagColors[m.tag] || "hsl(338 80% 62%)" }}
            >
              {m.tag}
            </span>
            <h3 className="font-display text-base text-foreground mb-2">{m.title}</h3>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">{m.body}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-16">
        <Heart className="w-6 h-6 text-primary/40 mx-auto mb-3" fill="currentColor" />
        <p className="font-display gradient-text text-lg" style={{ fontStyle: "italic" }}>
          "You make ordinary moments feel extraordinary."
        </p>
        <p className="text-primary/50 font-display text-sm tracking-wide mt-4">Mr.Mwendwa — always yours ❤️</p>
      </div>

    </div>
  </div>
  );
};

export default LaughsPage;

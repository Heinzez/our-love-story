import { Mail, Heart, Sparkles } from "lucide-react";

const letters = [
  {
    date: "A morning I couldn't stop thinking of you",
    subject: "How you start my days",
    body: `Before I even check my phone, before the day has had a chance to be anything, you're already in my mind. Not because I'm forcing it — but because that's just where you live now.

I hope you know that. That you're the first thing I think of, and the last. That the hours in between are better because you exist in them.

You don't have to do anything extraordinary. You already are.`,
  },
  {
    date: "A night I stayed up too late",
    subject: "Things I notice about you",
    body: `The way you get quiet when something's on your mind but you haven't figured out how to say it yet. How you light up around things you love. The small sounds you make when you're thinking.

I notice everything. I always have.

You are endlessly interesting to me — not in a complicated way, but in the way that I could sit across from you forever and never run out of things to find beautiful.`,
  },
  {
    date: "A difficult day made easier by you",
    subject: "What you do without knowing it",
    body: `You calm things down. Something about your presence — even just knowing you're there — makes the sharp edges of hard days a little softer.

I don't think you realize how much. How often just a message from you has turned something around. How many times I've exhaled because of you.

You are, without trying, the best part of my days.`,
  },
  {
    date: "A random Tuesday",
    subject: "Just because",
    body: `No occasion. No specific reason.

Just that I was sitting here thinking about how lucky I am. About the fact that someone like you exists, and that somehow you're in my life, and that I get to know you the way I do.

I love you. I love who you are — the way you think, the way you move through the world, the way you love. I wanted to write it down so you'd have it to come back to on days you need a reminder.`,
  },
  {
    date: "The future I'm building toward",
    subject: "What I want for us",
    body: `I want the ordinary things. Morning coffee. Shared playlists. Inside jokes that will never make sense to anyone else. Arguments we resolve before bed. Growing into better versions of ourselves, together.

I want to be someone you're proud to call yours. I want to earn the trust you place in me every single day.

And I want to keep writing you letters — for as long as you'll have me.`,
  },
];

const LettersPage = () => (
  <div className="min-h-screen pt-24 pb-20 px-4">
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="text-center mb-14">
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, hsl(338 80% 62% / 0.4))" }} />
          <Mail className="w-5 h-5 text-primary" />
          <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, hsl(338 80% 62% / 0.4), transparent)" }} />
        </div>
        <h1 className="text-4xl font-display gradient-text mb-3">My Letters To You</h1>
        <p className="text-muted-foreground font-body text-base leading-relaxed max-w-md mx-auto" style={{ fontStyle: "italic" }}>
          Words I wrote at 3am when missing you felt like a superpower.
        </p>
      </div>

      {/* Letters */}
      <div className="space-y-6">
        {letters.map((letter, i) => (
          <div key={i} className="rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
            style={{ background: "hsl(0 0% 100% / 0.025)", border: "1px solid hsl(338 80% 62% / 0.12)" }}>

            {/* Letter header */}
            <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: "hsl(338 80% 62% / 0.1)" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-body tracking-widest uppercase text-muted-foreground/60 mb-1">{letter.date}</p>
                  <h3 className="font-display text-base text-foreground">{letter.subject}</h3>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "hsl(338 80% 62% / 0.1)" }}>
                  <Heart className="w-4 h-4 text-primary" fill="currentColor" />
                </div>
              </div>
            </div>

            {/* Letter body */}
            <div className="px-6 py-5">
              <div className="text-muted-foreground font-body text-sm leading-7 whitespace-pre-line">
                {letter.body}
              </div>
              <p className="text-right text-primary/60 font-display text-sm tracking-wide mt-5 pt-4 border-t" style={{ borderColor: "hsl(338 80% 62% / 0.08)", fontStyle: "italic" }}>
                — always yours ❤️
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-16">
        <Sparkles className="w-5 h-5 text-primary/40 mx-auto mb-3" />
        <p className="font-display gradient-text text-lg" style={{ fontStyle: "italic" }}>
          "There will always be more letters."
        </p>
        <p className="text-primary/50 font-display text-sm tracking-wide mt-4">Mr.Mwendwa — always yours ❤️</p>
      </div>

    </div>
  </div>
);

export default LettersPage;

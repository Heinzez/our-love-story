import { useSite } from "@/context/SiteContext";
import { BookmarkPlus, X } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

const loveNotes = [
  "You are the reason I believe in magic. Every moment with you is a gift I never want to return.",
  "If I could rearrange the alphabet, I'd still keep U and I together — always.",
  "You don't just light up a room. You light up my entire world.",
  "I fall in love with you a little more every single day, and I didn't think that was possible.",
  "You are my favorite notification, my best chapter, and my greatest adventure.",
  "The world is better because you're in it. Never forget that.",
  "You are proof that beautiful things still exist in this world.",
  "I hope you know that someone out there thinks you're absolutely extraordinary.",
  "You deserve every flower, every sunset, and every love song ever written.",
  "Your smile could end wars. Your laugh could heal hearts. You are everything.",
  "Today is another day the universe got right — because you're in it.",
  "I wrote this site because no poem could ever capture what you mean to me.",
  "You're not just pretty. You're a whole constellation.",
  "Some people search their whole lives for what I found in you.",
  "If love were a language, you'd be every word worth saying.",
  "You make ordinary moments feel like scenes from a love story.",
  "I don't need the world — I just need you in mine.",
  "Every love song makes sense when I think of you.",
  "You are the calm in my chaos and the fire in my soul.",
  "The prettiest queen alive, and she doesn't even know it.",
  "You walked into my life and suddenly everything made sense.",
  "I never knew what 'forever' meant until I met you.",
  "If stars were wishes, I'd give you the entire sky.",
  "You are the melody in a world full of noise.",
  "My heart recognized you before my eyes even saw you.",
  "You're the kind of beautiful that poets write about but never quite capture.",
  "Every sunrise reminds me of you — warm, golden, and impossible to look away from.",
  "I'd choose you in a hundred lifetimes, in a hundred worlds, in any version of reality.",
  "You are my today and all of my tomorrows.",
  "Loving you is like breathing — I just can't stop.",
  "You are the answer to every prayer my heart has ever whispered.",
  "In a room full of art, I'd still stare at you.",
  "You are the plot twist I never saw coming but always needed.",
  "My favorite place in the world is next to you.",
  "You make me want to be the best version of myself — every single day.",
  "If I had a flower for every time you made me smile, I'd have an endless garden.",
  "You are the sunlight that makes my shadows disappear.",
  "The way you exist is enough reason to believe in miracles.",
  "I loved you yesterday. I love you still. I always have. I always will.",
  "You are not just my love — you are my home.",
  "Meeting you was like hearing a song for the first time and knowing it would be my favorite forever.",
  "You have this incredible way of making the whole world feel small and safe.",
  "I would cross every ocean, climb every mountain, just to see you smile.",
  "Your voice is my favorite sound. Your name is my favorite word.",
  "You taught me that love isn't just a feeling — it's a whole universe.",
  "If beauty were time, you'd be an eternity.",
  "You are the dream I refuse to wake up from.",
  "Every heartbeat of mine whispers your name.",
  "I didn't believe in soulmates until you proved me wrong.",
  "You are the kind of magic that the world doesn't deserve but desperately needs.",
  "The universe was showing off when it made you.",
  "You carry grace in your walk and fire in your soul — that's why you're a queen.",
  "My love for you isn't a chapter — it's the whole book.",
  "You are the reason I smile for no reason at all.",
  "If I could bottle the way you make me feel, I'd never run out of happiness.",
  "You are my greatest adventure and my safest place to land.",
  "I look at you and I see the rest of my life in front of my eyes.",
  "You're the first thought in my morning and the last whisper in my night.",
  "They say home is where the heart is — so you must be my home.",
  "You are not just beautiful on the outside. Your soul glows.",
  "In every lifetime, in every universe, I'd always find my way to you.",
  "You are rarer than a double rainbow on a Tuesday morning.",
  "If I wrote a book about my life, you'd be the best chapter.",
  "You are someone the stars would gossip about.",
  "Every version of me loves every version of you.",
  "You are my most answered prayer.",
  "The world became more beautiful the day you arrived in it.",
];

const WelcomeNote = () => {
  const { showWelcomeNote, setShowWelcomeNote, saveNote } = useSite();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const todayNote = useMemo(() => {
    const idx = parseInt(sessionStorage.getItem("queen-note-idx") ?? "0", 10);
    return loveNotes[idx % loveNotes.length];
  }, []);

  // Animate in
  useEffect(() => {
    if (showWelcomeNote) {
      setVisible(true);
      // Auto-open envelope after 600ms
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, [showWelcomeNote]);

  if (!showWelcomeNote) return null;

  const handleSave = () => {
    saveNote({
      id: crypto.randomUUID(),
      text: todayNote,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    });
    setShowWelcomeNote(false);
  };

  const handleDiscard = () => setShowWelcomeNote(false);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500"
      style={{
        background: "rgba(4,1,10,0.88)",
        backdropFilter: "blur(18px)",
        opacity: visible ? 1 : 0,
      }}
      onClick={handleDiscard}
    >
      <div
        className="relative mx-4 select-none"
        style={{ width: "min(460px, 92vw)" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Envelope body (always visible) ── */}
        <div
          className="relative rounded-2xl overflow-hidden transition-all duration-700"
          style={{
            background: "linear-gradient(160deg, #f9f0dc, #f3e6c8)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(180,140,80,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >

          {/* Envelope top-flap (V-shape) — folds up when open */}
          <div
            className="absolute top-0 left-0 right-0 z-20 transition-transform duration-700 origin-top"
            style={{
              transform: open ? "rotateX(-180deg)" : "rotateX(0deg)",
              transformStyle: "preserve-3d",
              height: "110px",
            }}
          >
            {/* Flap triangle */}
            <div
              style={{
                width: "100%",
                height: "110px",
                background: "linear-gradient(170deg, #e8d5a0, #d4b96a)",
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                boxShadow: "inset 0 -1px 0 rgba(130,90,30,0.2)",
              }}
            />
            {/* Wax seal on flap */}
            <div
              className="absolute left-1/2 -translate-x-1/2"
              style={{ bottom: "-18px" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-display"
                style={{
                  background: "radial-gradient(circle at 35% 35%, hsl(338 80% 55%), hsl(338 80% 40%))",
                  boxShadow: "0 2px 8px rgba(180,40,80,0.5), inset 0 1px 0 rgba(255,180,200,0.3)",
                  color: "#ffd4e0",
                  letterSpacing: "0.05em",
                }}
              >
                ♥
              </div>
            </div>
          </div>

          {/* ── Letter paper inside ── */}
          <div
            className="transition-all duration-700 overflow-hidden"
            style={{
              maxHeight: open ? "600px" : "0px",
              opacity: open ? 1 : 0,
            }}
          >
            <div className="pt-16 pb-8 px-8">

              {/* Decorative header line */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(150,100,40,0.3))" }} />
                <span className="text-[10px] tracking-[0.25em] uppercase font-body" style={{ color: "rgba(120,80,30,0.6)" }}>
                  A Letter For You
                </span>
                <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(150,100,40,0.3), transparent)" }} />
              </div>

              {/* Date */}
              <p className="text-xs font-body mb-5" style={{ color: "rgba(100,70,30,0.55)" }}>
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>

              {/* Greeting */}
              <p className="font-script text-xl mb-3" style={{ color: "rgba(80,50,20,0.75)" }}>
                My dearest queen,
              </p>

              {/* Note body — subtle horizontal lines like ruled paper */}
              <div
                className="relative py-5 px-1 mb-5"
                style={{
                  background: "repeating-linear-gradient(transparent, transparent 27px, rgba(150,110,50,0.12) 27px, rgba(150,110,50,0.12) 28px)",
                }}
              >
                <p className="font-script text-lg leading-[28px]" style={{ color: "rgba(50,30,10,0.85)" }}>
                  "{todayNote}"
                </p>
              </div>

              {/* Signature */}
              <div className="flex items-end justify-between mt-2">
                <p className="font-script text-base" style={{ color: "rgba(80,50,20,0.7)" }}>
                  Always yours,
                  <br />
                  <span className="text-2xl" style={{ color: "rgba(160,60,90,0.9)" }}>Mr. Mwendwa ♥</span>
                </p>
                {/* Small rose decoration */}
                <span className="text-3xl opacity-40">🌹</span>
              </div>

              {/* Fold crease line */}
              <div className="mt-6 mb-5 h-px w-full" style={{ background: "rgba(150,110,50,0.15)", boxShadow: "0 1px 0 rgba(255,255,255,0.5)" }} />

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display text-sm tracking-wide transition-all hover:opacity-90"
                  style={{
                    background: "linear-gradient(135deg, hsl(338 80% 58%), hsl(355 70% 62%))",
                    color: "#fff",
                    boxShadow: "0 2px 12px hsl(338 80% 58% / 0.4)",
                  }}
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  Save this note
                </button>
                <button
                  onClick={handleDiscard}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-display text-sm tracking-wide border transition-all hover:opacity-80"
                  style={{ borderColor: "rgba(150,110,50,0.35)", color: "rgba(80,50,20,0.7)", background: "transparent" }}
                >
                  <X className="w-3.5 h-3.5" />
                  Close
                </button>
              </div>

            </div>
          </div>

          {/* Envelope bottom-fold lines */}
          {!open && (
            <div className="h-24" style={{ background: "linear-gradient(170deg, #e8d5a0, #d4b96a)" }}>
              <div
                style={{
                  width: "100%",
                  height: "96px",
                  background: "linear-gradient(10deg, #e8d5a0, #d4b96a)",
                  clipPath: "polygon(0 100%, 100% 100%, 50% 0%)",
                  position: "absolute",
                  bottom: 0,
                }}
              />
            </div>
          )}
        </div>

        {/* Hint text */}
        {!open && (
          <p className="text-center text-white/30 text-xs font-body mt-4 tracking-widest animate-pulse">
            opening your letter...
          </p>
        )}

      </div>
    </div>
  );
};

export default WelcomeNote;

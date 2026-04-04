import { useState } from "react";
import { Gift, Heart, Lock, Sparkles } from "lucide-react";
import FloatingElements from "@/components/FloatingElements";

interface GiftItem {
  id: number;
  title: string;
  hint: string;
  message: string;
  emoji: string;
  unlockDate?: Date;
}

const gifts: GiftItem[] = [
  {
    id: 1,
    title: "A Promise",
    hint: "Open me first 💕",
    message: "I promise to always choose you — in every timeline, every universe, every version of us. You are my forever.",
    emoji: "💍",
  },
  {
    id: 2,
    title: "A Memory",
    hint: "Something we shared...",
    message: "Remember the first time we laughed until we couldn't breathe? That moment lives in my heart rent-free.",
    emoji: "🎞️",
  },
  {
    id: 3,
    title: "A Dream",
    hint: "For our future...",
    message: "One day, I want to wake up next to you in a home we built together — with a kitchen full of your cooking and a living room full of our laughter.",
    emoji: "🏡",
  },
  {
    id: 4,
    title: "A Confession",
    hint: "I never told you this...",
    message: "The first time I saw you, I forgot every word I'd ever learned. You made my mind go completely blank — and it was the most beautiful feeling.",
    emoji: "🤫",
  },
  {
    id: 5,
    title: "A Song",
    hint: "Listen closely...",
    message: "Every love song on my playlist is about you. Every single one. I didn't choose them — my heart did.",
    emoji: "🎵",
  },
  {
    id: 6,
    title: "A Wish",
    hint: "If I had one wish...",
    message: "I'd wish for more time with you. Not because we don't have enough — but because every second with you is a second I want to multiply by infinity.",
    emoji: "⭐",
  },
  {
    id: 7,
    title: "A Secret",
    hint: "Between us only...",
    message: "Sometimes I re-read our old messages and smile like an idiot. You have that power over me, and I never want it to stop.",
    emoji: "🔐",
    unlockDate: new Date("2025-06-01"),
  },
  {
    id: 8,
    title: "The Biggest Gift",
    hint: "Save this for last...",
    message: "The biggest gift isn't in a box. It's you. You existing. You being you. You choosing to let me love you. That's everything.",
    emoji: "👑",
    unlockDate: new Date("2025-08-01"),
  },
];

const GiftsPage = () => {
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());

  const toggleReveal = (gift: GiftItem) => {
    if (gift.unlockDate && new Date() < gift.unlockDate) return;
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(gift.id)) next.delete(gift.id);
      else next.add(gift.id);
      return next;
    });
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 relative">
      <FloatingElements />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-14 animate-fade-in-up">
          <Gift className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-display gradient-text mb-3">
            Gifts For You
          </h1>
          <p className="font-script text-xl text-accent/80 max-w-md mx-auto">
            Each box holds something from my heart. Tap to unwrap 💕
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {gifts.map((gift, i) => {
            const isRevealed = revealedIds.has(gift.id);
            const isLocked = gift.unlockDate && new Date() < gift.unlockDate;

            return (
              <button
                key={gift.id}
                onClick={() => toggleReveal(gift)}
                disabled={!!isLocked}
                className={`relative group rounded-2xl p-6 text-center transition-all duration-500 animate-fade-in-up aspect-square flex flex-col items-center justify-center ${
                  isRevealed
                    ? "glass-card border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                    : isLocked
                    ? "glass-card opacity-60 cursor-not-allowed"
                    : "glass-card hover:border-primary/20 hover:shadow-[0_0_20px_hsl(var(--primary)/0.15)] cursor-pointer"
                }`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {isLocked && (
                  <Lock className="w-5 h-5 text-muted-foreground absolute top-3 right-3" />
                )}

                {isRevealed ? (
                  <div className="animate-fade-in-up">
                    <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-foreground font-script text-sm leading-relaxed italic">
                      "{gift.message}"
                    </p>
                    <div className="mt-3 text-xs text-primary font-display tracking-wide">
                      Mr.Mwendwa ❤️💍
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {isLocked ? "🔒" : gift.emoji}
                    </span>
                    <h3 className="font-display text-foreground text-sm mb-1">{gift.title}</h3>
                    <p className="text-muted-foreground text-xs font-body">{gift.hint}</p>
                  </>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center mt-14 animate-fade-in-up" style={{ animationDelay: "1s" }}>
          <div className="glass-card rounded-2xl max-w-md mx-auto p-8">
            <Heart className="w-8 h-8 text-primary mx-auto mb-3 animate-heartbeat" fill="hsl(var(--primary))" strokeWidth={0} />
            <p className="font-script text-lg text-foreground italic">
              "The best gift I can give you is my heart — and it's already yours."
            </p>
            <div className="mt-4 text-primary font-display text-sm tracking-wide">
              Mr.Mwendwa — always yours ❤️💍
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GiftsPage;

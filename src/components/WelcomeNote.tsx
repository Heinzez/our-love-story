import { useSite } from "@/context/SiteContext";
import { Heart, BookmarkPlus, X } from "lucide-react";
import { useMemo } from "react";

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
];

const WelcomeNote = () => {
  const { showWelcomeNote, setShowWelcomeNote, saveNote } = useSite();

  const todayNote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return loveNotes[dayOfYear % loveNotes.length];
  }, []);

  if (!showWelcomeNote) return null;

  const handleSave = () => {
    saveNote({
      id: crypto.randomUUID(),
      text: todayNote,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    });
    setShowWelcomeNote(false);
  };

  const handleDiscard = () => {
    setShowWelcomeNote(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md animate-fade-in-up">
      <div className="glass-card rounded-2xl p-10 max-w-lg w-full mx-4 text-center">
        <Heart className="w-10 h-10 text-primary mx-auto mb-4 animate-heartbeat" />
        <h2 className="text-2xl font-display gradient-text mb-2">A Note For You Today</h2>
        <p className="text-muted-foreground font-script text-lg mb-6">Read it. Feel it. 💕</p>

        <div className="bg-muted/20 rounded-xl p-6 mb-6 border border-border/30">
          <p className="text-foreground font-script text-xl leading-relaxed italic">
            "{todayNote}"
          </p>
        </div>

        <div className="text-primary font-display text-sm tracking-wide mb-8">
          Mr.Mwendwa — always yours ❤️💍
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-display tracking-wide hover:opacity-90 transition-all"
          >
            <BookmarkPlus className="w-4 h-4" />
            Save Note
          </button>
          <button
            onClick={handleDiscard}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-muted/30 text-foreground font-display tracking-wide hover:bg-muted/50 transition-all border border-border/30"
          >
            <X className="w-4 h-4" />
            Discard
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeNote;

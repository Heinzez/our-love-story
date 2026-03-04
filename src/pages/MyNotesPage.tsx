import { useSite } from "@/context/SiteContext";
import { BookOpen, Heart } from "lucide-react";
import FloatingElements from "@/components/FloatingElements";

const MyNotesPage = () => {
  const { savedNotes } = useSite();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative">
      <FloatingElements />
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
          <h1 className="text-4xl font-display gradient-text mb-2">My Saved Notes</h1>
          <p className="text-muted-foreground font-script text-xl">Little love letters you chose to keep 💕</p>
        </div>

        {savedNotes.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center animate-fade-in-up">
            <Heart className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-body">No saved notes yet.</p>
            <p className="text-muted-foreground font-body text-sm mt-1">Save a daily note when you enter the site 💌</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savedNotes.map((note, i) => (
              <div
                key={note.id}
                className="glass-card rounded-xl p-6 animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <p className="text-foreground font-script text-lg italic mb-3">"{note.text}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-body">{note.date}</span>
                  <span className="text-xs text-primary font-display">Mr.Mwendwa ❤️💍</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyNotesPage;

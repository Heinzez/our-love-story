import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SavedNote {
  id: string;
  text: string;
  date: string;
}

interface SiteContextType {
  isAdmin: boolean;
  isAuthenticated: boolean;
  subscribedEmail: string | null;
  backupEmail: string | null;
  savedNotes: SavedNote[];
  showWelcomeNote: boolean;
  hasNewNote: boolean;
  setIsAdmin: (v: boolean) => void;
  setIsAuthenticated: (v: boolean) => void;
  setSubscribedEmail: (email: string, backup?: string) => void;
  saveNote: (note: SavedNote) => void;
  setShowWelcomeNote: (v: boolean) => void;
  clearNewNote: () => void;
}

const SiteContext = createContext<SiteContextType | null>(null);

export const useSite = () => {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
};

export const SiteProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWelcomeNote, setShowWelcomeNote] = useState(false);
  const [hasNewNote, setHasNewNote] = useState(false);
  const [subscribedEmail, setSubscribedEmailState] = useState<string | null>(null);
  const [backupEmail, setBackupEmailState] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    setSubscribedEmailState(localStorage.getItem("queen-email"));
    setBackupEmailState(localStorage.getItem("queen-backup-email"));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetch("/api/saved-notes")
        .then((r) => r.json())
        .then((data: SavedNote[]) => {
          if (Array.isArray(data)) setSavedNotes(data);
        })
        .catch((err) => console.error("Failed to load notes:", err));
    }
  }, [isAuthenticated]);

  const handleSetEmail = async (email: string, backup?: string) => {
    localStorage.setItem("queen-email", email);
    setSubscribedEmailState(email);
    if (backup) {
      localStorage.setItem("queen-backup-email", backup);
      setBackupEmailState(backup);
    }
    try {
      await fetch("/api/subscribe-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary_email: email, backup_email: backup || null }),
      });
    } catch (err) {
      console.error("Failed to store email:", err);
    }
  };

  const handleSetAuthenticated = (v: boolean) => {
    setIsAuthenticated(v);
    if (v) {
      // Session-specific: only show once per browser session.
      // sessionStorage clears on tab/window close → new session = new note.
      const alreadyShown = sessionStorage.getItem("queen-note-shown") === "1";
      if (!alreadyShown) {
        // Assign a stable random note index for this session
        if (!sessionStorage.getItem("queen-note-idx")) {
          sessionStorage.setItem("queen-note-idx", String(Math.floor(Math.random() * 66)));
        }
        setShowWelcomeNote(true);
        sessionStorage.setItem("queen-note-shown", "1");
      }
    }
  };

  const saveNote = async (note: SavedNote) => {
    if (isAdmin) {
      setShowWelcomeNote(false);
      return;
    }

    try {
      const res = await fetch("/api/saved-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: note.id, text: note.text, date: note.date }),
      });
      if (res.ok) {
        setSavedNotes((prev) => [note, ...prev]);
        setHasNewNote(true);
      }
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  const clearNewNote = () => setHasNewNote(false);

  return (
    <SiteContext.Provider value={{
      isAdmin, isAuthenticated, subscribedEmail, backupEmail, savedNotes, showWelcomeNote, hasNewNote,
      setIsAdmin, setIsAuthenticated: handleSetAuthenticated, setSubscribedEmail: handleSetEmail,
      saveNote, setShowWelcomeNote, clearNewNote,
    }}>
      {children}
    </SiteContext.Provider>
  );
};

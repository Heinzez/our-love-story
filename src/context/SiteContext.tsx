import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  setIsAdmin: (v: boolean) => void;
  setIsAuthenticated: (v: boolean) => void;
  setSubscribedEmail: (email: string, backup?: string) => void;
  saveNote: (note: SavedNote) => void;
  setShowWelcomeNote: (v: boolean) => void;
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
  const [subscribedEmail, setSubscribedEmailState] = useState<string | null>(
    localStorage.getItem("queen-email")
  );
  const [backupEmail, setBackupEmailState] = useState<string | null>(
    localStorage.getItem("queen-backup-email")
  );
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>(() => {
    const stored = localStorage.getItem("queen-saved-notes");
    return stored ? JSON.parse(stored) : [];
  });

  const handleSetEmail = async (email: string, backup?: string) => {
    localStorage.setItem("queen-email", email);
    setSubscribedEmailState(email);
    if (backup) {
      localStorage.setItem("queen-backup-email", backup);
      setBackupEmailState(backup);
    }
    // Store to database via edge function
    try {
      await supabase.functions.invoke('subscribe-email', {
        body: { primary_email: email, backup_email: backup || null },
      });
    } catch (err) {
      console.error('Failed to store email to database:', err);
    }
  };

  const handleSetAuthenticated = (v: boolean) => {
    setIsAuthenticated(v);
    if (v) setShowWelcomeNote(true);
  };

  const saveNote = (note: SavedNote) => {
    const updated = [...savedNotes, note];
    setSavedNotes(updated);
    localStorage.setItem("queen-saved-notes", JSON.stringify(updated));
  };

  return (
    <SiteContext.Provider value={{
      isAdmin, isAuthenticated, subscribedEmail, backupEmail, savedNotes, showWelcomeNote,
      setIsAdmin, setIsAuthenticated: handleSetAuthenticated, setSubscribedEmail: handleSetEmail,
      saveNote, setShowWelcomeNote,
    }}>
      {children}
    </SiteContext.Provider>
  );
};

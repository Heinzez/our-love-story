import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SavedNote {
  id: string;
  text: string;
  date: string;
}

export interface PageSetting {
  page_key: string;
  premiere_date: string | null;
  description: string | null;
}

export interface PageImage {
  id: string;
  page_key: string;
  image_path: string;
  caption: string | null;
  sort_order: number;
  media_type?: string;
  publicUrl: string;
}

interface SiteContextType {
  isAdmin: boolean;
  isAuthenticated: boolean;
  adminToken: string | null;
  subscribedEmail: string | null;
  backupEmail: string | null;
  savedNotes: SavedNote[];
  pageSettings: Record<string, PageSetting>;
  pageImages: Record<string, PageImage[]>;
  showWelcomeNote: boolean;
  hasNewNote: boolean;
  setIsAdmin: (v: boolean) => void;
  setIsAuthenticated: (v: boolean) => void;
  setAdminToken: (t: string | null) => void;
  setSubscribedEmail: (email: string, backup?: string) => void;
  saveNote: (note: SavedNote) => void;
  setShowWelcomeNote: (v: boolean) => void;
  clearNewNote: () => void;
  refreshPageData: () => Promise<void>;
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
  const [adminToken, setAdminTokenState] = useState<string | null>(null);
  const [showWelcomeNote, setShowWelcomeNote] = useState(false);
  const [hasNewNote, setHasNewNote] = useState(false);
  const [subscribedEmail, setSubscribedEmailState] = useState<string | null>(null);
  const [backupEmail, setBackupEmailState] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [pageSettings, setPageSettings] = useState<Record<string, PageSetting>>({});
  const [pageImages, setPageImages] = useState<Record<string, PageImage[]>>({});

  const refreshPageData = async () => {
    const [{ data: settings }, { data: images }] = await Promise.all([
      supabase.from("page_settings").select("page_key, premiere_date, description"),
      supabase.from("page_images").select("id, page_key, image_path, caption, sort_order, media_type").order("sort_order", { ascending: true }),
    ]);
    if (settings) {
      const map: Record<string, PageSetting> = {};
      for (const s of settings as PageSetting[]) map[s.page_key] = s;
      setPageSettings(map);
    }
    if (images) {
      const grouped: Record<string, PageImage[]> = {};
      for (const img of images as Omit<PageImage, "publicUrl">[]) {
        const { data: pub } = supabase.storage.from("premiere-media").getPublicUrl(img.image_path);
        const enriched: PageImage = { ...img, publicUrl: pub.publicUrl };
        (grouped[img.page_key] ||= []).push(enriched);
      }
      setPageImages(grouped);
    }
  };

  useEffect(() => {
    refreshPageData();
  }, []);

  const setAdminToken = (t: string | null) => {
    setAdminTokenState(t);
    if (t) sessionStorage.setItem("queen-admin-token", t);
    else sessionStorage.removeItem("queen-admin-token");
  };

  useEffect(() => {
    const t = sessionStorage.getItem("queen-admin-token");
    if (t) setAdminTokenState(t);
  }, []);

  useEffect(() => {
    setSubscribedEmailState(localStorage.getItem("queen-email"));
    setBackupEmailState(localStorage.getItem("queen-backup-email"));
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      supabase
        .from("saved_notes")
        .select("id, text, date")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && Array.isArray(data)) {
            setSavedNotes(data as SavedNote[]);
          }
        });
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
      await supabase.from("email_subscribers").insert({
        primary_email: email,
        backup_email: backup || null,
      });
    } catch (err) {
      console.error("Failed to store email:", err);
    }
  };

  const handleSetAuthenticated = (v: boolean) => {
    setIsAuthenticated(v);
    if (v) {
      const alreadyShown = sessionStorage.getItem("queen-note-shown") === "1";
      if (!alreadyShown) {
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
      const { error } = await supabase.from("saved_notes").insert({
        id: note.id,
        text: note.text,
        date: note.date,
      });
      if (!error) {
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
      isAdmin, isAuthenticated, adminToken, subscribedEmail, backupEmail, savedNotes,
      pageSettings, pageImages, showWelcomeNote, hasNewNote,
      setIsAdmin, setIsAuthenticated: handleSetAuthenticated, setAdminToken,
      setSubscribedEmail: handleSetEmail,
      saveNote, setShowWelcomeNote, clearNewNote, refreshPageData,
    }}>
      {children}
    </SiteContext.Provider>
  );
};

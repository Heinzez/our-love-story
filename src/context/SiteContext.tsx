import { createContext, useContext, useState, ReactNode } from "react";

interface SiteContextType {
  isAdmin: boolean;
  isAuthenticated: boolean;
  subscribedEmail: string | null;
  setIsAdmin: (v: boolean) => void;
  setIsAuthenticated: (v: boolean) => void;
  setSubscribedEmail: (email: string) => void;
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
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(
    localStorage.getItem("queen-email")
  );

  const handleSetEmail = (email: string) => {
    localStorage.setItem("queen-email", email);
    setSubscribedEmail(email);
  };

  return (
    <SiteContext.Provider value={{ isAdmin, isAuthenticated, subscribedEmail, setIsAdmin, setIsAuthenticated, setSubscribedEmail: handleSetEmail }}>
      {children}
    </SiteContext.Provider>
  );
};

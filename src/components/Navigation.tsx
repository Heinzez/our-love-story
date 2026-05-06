import { useSite } from "@/context/SiteContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Heart, BookOpen, Compass, Smile, Mail,
  Sparkles, ScrollText, Shield, Gift,
  MoreHorizontal, FolderLock, Wallet,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

const tabs = [
  { path: "/our-story",   label: "Our Story",       Icon: BookOpen  },
  { path: "/the-journey", label: "The Journey",      Icon: Compass   },
  { path: "/laughs",      label: "Laughs",           Icon: Smile     },
  { path: "/letters",     label: "Letters",          Icon: Mail      },
  { path: "/goals",       label: "Goals & Dreams",   Icon: Sparkles  },
  { path: "/my-notes",    label: "My Notes",         Icon: ScrollText },
  { path: "/gift",        label: "Gift",             Icon: Gift      },
];

const Navigation = () => {
  const { isAdmin, hasNewNote, clearNewNote } = useSite();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname === "/my-notes" && hasNewNote) clearNewNote();
  }, [location.pathname, hasNewNote, clearNewNote]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const moreItems = [
    { label: "File Vault", Icon: FolderLock, comingSoon: true },
    { label: "FinTip", Icon: Wallet, comingSoon: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glass bar */}
      <div
        className="relative"
        style={{
          background: "hsl(340 18% 7% / 0.75)",
          backdropFilter: "blur(24px) saturate(1.4)",
          borderBottom: "1px solid hsl(338 80% 62% / 0.12)",
          boxShadow: "0 1px 0 hsl(338 80% 62% / 0.06), 0 4px 24px hsl(340 18% 4% / 0.4)",
        }}
      >
        {/* Subtle pink gradient line at very bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, hsl(338 80% 62% / 0.35) 30%, hsl(355 70% 68% / 0.35) 70%, transparent)" }}
        />

        <div className="max-w-7xl mx-auto px-5">
          <div className="flex items-center h-[58px] gap-5">

            {/* Logo */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <div className="relative">
                <Heart
                  className="w-5 h-5 text-primary animate-heartbeat"
                  fill="currentColor"
                />
                <div className="absolute inset-0 blur-sm opacity-50 text-primary">
                  <Heart className="w-5 h-5" fill="currentColor" />
                </div>
              </div>
              <span
                className="font-display text-[15px] tracking-wide hidden sm:block transition-colors"
                style={{ background: "linear-gradient(135deg, hsl(338 80% 72%), hsl(355 70% 75%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
              >
                For My Queen
              </span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-border/30 shrink-0 hidden sm:block" />

            {/* Tabs */}
            <div className="flex-1 overflow-x-auto nav-scrollbar">
              <div className="flex items-center gap-0.5 min-w-max py-1">
                {tabs.map(({ path, label, Icon }) => {
                  const isActive = location.pathname === path;
                  const isNotes = path === "/my-notes";
                  const pulse = isNotes && hasNewNote;

                  return (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-body tracking-wide whitespace-nowrap transition-all duration-200 group"
                      style={
                        isActive
                          ? {
                              background: "hsl(338 80% 62% / 0.12)",
                              color: "hsl(338 80% 72%)",
                              boxShadow: "0 0 0 1px hsl(338 80% 62% / 0.2), inset 0 1px 0 hsl(338 80% 80% / 0.08)",
                            }
                          : {
                              color: "hsl(30 10% 52%)",
                            }
                      }
                    >
                      <Icon
                        className="w-3.5 h-3.5 transition-colors"
                        style={{ color: isActive ? "hsl(338 80% 68%)" : undefined }}
                      />
                      <span className={`transition-colors ${!isActive ? "group-hover:text-foreground" : ""}`}>
                        {label}
                      </span>

                      {/* Hover bg for inactive */}
                      {!isActive && (
                        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-muted/25" />
                      )}

                      {/* Active dot indicator */}
                      {isActive && (
                        <span
                          className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                          style={{ background: "linear-gradient(90deg, hsl(338 80% 62%), hsl(355 70% 68%))" }}
                        />
                      )}

                      {/* New note pulse */}
                      {pulse && (
                        <span className="absolute -top-1 -right-0.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_6px_hsl(338_80%_62%)]">
                          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin link */}
            {isAdmin && (
              <button
                onClick={() => navigate("/admin")}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg font-body shrink-0 transition-all"
                style={
                  location.pathname === "/admin"
                    ? { background: "hsl(338 80% 62% / 0.2)", color: "hsl(338 80% 72%)", border: "1px solid hsl(338 80% 62% / 0.35)" }
                    : { background: "hsl(338 80% 62% / 0.08)", color: "hsl(338 80% 62%)", border: "1px solid hsl(338 80% 62% / 0.18)" }
                }
              >
                <Shield className="w-3 h-3" />
                Admin
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

import { useSite } from "@/context/SiteContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";

const tabs = [
  { path: "/", label: "Home" },
  { path: "/our-story", label: "Our Story", icon: "📖" },
  { path: "/the-journey", label: "The Journey", icon: "🗺️" },
  { path: "/laughs", label: "Laughs & Bloopers", icon: "😂" },
  { path: "/letters", label: "My Letters To You", icon: "💌" },
  { path: "/goals", label: "Goals & Dreams", icon: "⭐" },
  { path: "/my-notes", label: "My Notes", icon: "📝" },
];

const Navigation = () => {
  const { isAdmin } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center h-16 gap-6">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5 text-primary shrink-0 group">
            <Heart className="w-5 h-5 animate-heartbeat text-primary" />
            <span className="font-display text-lg tracking-wide hidden sm:block group-hover:text-accent transition-colors">
              For My Queen
            </span>
          </button>

          <div className="h-8 w-px bg-border/40 shrink-0 hidden sm:block" />

          {/* Scrollable tabs */}
          <div className="flex-1 overflow-x-auto nav-scrollbar">
            <div className="flex items-center gap-1 min-w-max py-1">
              {tabs.slice(1).map((tab) => (
                <button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body tracking-wide whitespace-nowrap transition-all duration-200 ${
                    location.pathname === tab.path
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/20"
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <span className="text-xs bg-primary/15 text-primary px-3 py-1 rounded-full font-body border border-primary/20 shrink-0">
              Admin
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

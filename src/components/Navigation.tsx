import { useSite } from "@/context/SiteContext";
import { useLocation, useNavigate } from "react-router-dom";
import { Heart, Home } from "lucide-react";

const tabs = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/our-story", label: "Our Story", icon: "📖" },
  { path: "/the-journey", label: "The Journey", icon: "🗺️" },
  { path: "/laughs", label: "Laughs & Bloopers", icon: "😂" },
  { path: "/letters", label: "My Letters To You", icon: "💌" },
  { path: "/goals", label: "Goals & Dreams", icon: "⭐" },
];

const Navigation = () => {
  const { isAdmin } = useSite();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-primary">
            <Heart className="w-5 h-5" />
            <span className="font-display text-lg hidden sm:block">For My Queen</span>
          </button>

          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`px-3 py-2 rounded-lg text-sm font-body whitespace-nowrap transition-all ${
                  location.pathname === tab.path
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {isAdmin && (
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-body">
              Admin
            </span>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

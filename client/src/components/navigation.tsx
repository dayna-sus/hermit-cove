import { useLocation } from "wouter";
import { Home, Book, Trophy, Sparkles } from "lucide-react";

// Custom crab icon component
const CrabIcon = ({ className }: { className?: string }) => (
  <span className={`text-base ${className}`}>🦀</span>
);

interface NavigationProps {
  userProgress?: {
    completedSuggestions: number;
    currentWeek: number;
  };
}

export default function Navigation({ userProgress }: NavigationProps) {
  const [location, navigate] = useLocation();
  
  const navItems = [
    { path: "/", icon: Home, label: "Home", testId: "nav-home" },
    { path: "/dashboard", icon: CrabIcon, label: "Journey", testId: "nav-journey" },
    { path: "/journal", icon: Book, label: "Journal", testId: "nav-journal" },
  ];

  // Add celebration nav item if user has completed at least one week
  if (userProgress && userProgress.completedSuggestions >= 7) {
    navItems.push({ 
      path: "/celebrate", 
      icon: Trophy, 
      label: "Celebrate", 
      testId: "nav-celebrate" 
    });
  }

  // Add final celebration if completed all 42 suggestions
  if (userProgress && userProgress.completedSuggestions >= 42) {
    navItems.push({ 
      path: "/final-celebration", 
      icon: Sparkles, 
      label: "Victory", 
      testId: "nav-victory" 
    });
  }

  return (
    <nav 
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card/80 backdrop-blur-lg rounded-full px-3 py-2 border border-border shadow-md z-50"
      data-testid="bottom-navigation"
    >
      <div className="flex items-center gap-3">
        {navItems.map(({ path, icon: Icon, label, testId }) => {
          const isActive = location === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`
                flex flex-col items-center gap-0.5 transition-colors
                ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}
              `}
              data-testid={testId}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs leading-tight">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

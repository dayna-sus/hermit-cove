import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// Pages
import LandingPage from "@/pages/landing";
import CourseDashboard from "@/pages/course-dashboard";
import SuggestionPage from "@/pages/suggestion";
import WeeklyCompletionPage from "@/pages/weekly-completion";
import JournalPage from "@/pages/journal";
import FinalCelebrationPage from "@/pages/final-celebration";
import AboutCreatorPage from "@/pages/about-creator";
import NotFound from "@/pages/not-found";

// Components
import Navigation from "@/components/navigation";

import type { User } from "@shared/schema";

function AppContent() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    setUserId(storedUserId);
  }, []);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen" data-testid="app-container">
      <Switch>
        {/* Landing page */}
        <Route path="/" component={LandingPage} />
        
        {/* Course dashboard */}
        <Route path="/dashboard" component={CourseDashboard} />
        
        {/* Individual suggestions */}
        <Route path="/suggestion/:week/:day">
          {(params) => <SuggestionPage params={params} />}
        </Route>
        
        {/* Weekly completion pages */}
        <Route path="/week/:week/complete">
          {(params) => <WeeklyCompletionPage params={params} />}
        </Route>
        
        {/* Journal section */}
        <Route path="/journal" component={JournalPage} />
        
        {/* Final celebration */}
        <Route path="/final-celebration" component={FinalCelebrationPage} />
        
        {/* About creator */}
        <Route path="/about-creator" component={AboutCreatorPage} />
        
        {/* Legacy celebrate route - redirect to dashboard */}
        <Route path="/celebrate">
          {() => {
            window.location.href = "/dashboard";
            return null;
          }}
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      
      {/* Navigation - only show if user exists and not on landing page */}
      {userId && user && (
        <Navigation userProgress={{
          completedSuggestions: user.completedSuggestions,
          currentWeek: user.currentWeek,
        }} />
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

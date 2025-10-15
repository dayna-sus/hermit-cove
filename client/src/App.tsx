import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

// Pages
import LandingPage from "@/pages/landing";
import CourseDashboard from "@/pages/course-dashboard";
import SuggestionPage from "@/pages/suggestion";
import WeeklyCompletionPage from "@/pages/weekly-completion";
import ReflectionHistoryPage from "@/pages/reflection-history";
import AllReflectionsPage from "@/pages/all-reflections";
import JournalPage from "@/pages/journal";
import FinalCelebrationPage from "@/pages/final-celebration";
import AboutCreatorPage from "@/pages/about-creator";
import FeedbackListPage from "@/pages/feedback-list";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

// Components

import type { User } from "@shared/schema";

function AppContent() {
  const [userId, setUserId] = useState<string | null>(null);
  
  // Track page views when routes change
  useAnalytics();

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
        
        {/* Reflection history */}
        <Route path="/reflections" component={ReflectionHistoryPage} />
        
        {/* All daily reflections */}
        <Route path="/all-reflections" component={AllReflectionsPage} />
        
        {/* Journal section */}
        <Route path="/journal" component={JournalPage} />
        
        {/* Final celebration */}
        <Route path="/final-celebration" component={FinalCelebrationPage} />
        
        {/* About creator */}
        <Route path="/about-creator" component={AboutCreatorPage} />
        
        {/* Feedback list */}
        <Route path="/feedback" component={FeedbackListPage} />
        
        {/* Admin dashboard */}
        <Route path="/admin" component={AdminDashboard} />
        
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
      
    </div>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);
  
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

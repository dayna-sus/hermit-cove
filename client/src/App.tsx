import { useEffect, useState } from "react";
import { Route, Switch, Redirect } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";

import { queryClient } from "./lib/queryClient";
import { initGA } from "./lib/analytics";
import { useAnalytics } from "./hooks/use-analytics";

// Pages
import LandingPage from "@/pages/landing";
import CourseDashboard from "@/pages/course-dashboard";
import SuggestionPage from "@/pages/suggestion";
import WeeklyCompletionPage from "@/pages/weekly-completion";
import ReflectionHistoryPage from "@/pages/reflection-history";
import JournalPage from "@/pages/journal";
import FinalCelebrationPage from "@/pages/final-celebration";
import AboutCreatorPage from "@/pages/about-creator";
import FeedbackListPage from "@/pages/feedback-list";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

import type { User } from "@shared/schema";

function AppContent() {
  const [userId, setUserId] = useState<string | null>(null);

  // Track page views when routes change
  useAnalytics();

  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    setUserId(storedUserId);
  }, []);

  // Keeping your existing user query (safe even if backend isn't running)
  useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  return (
<div className="min-h-screen" data-testid="app-container">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/dashboard" component={CourseDashboard} />

        <Route path="/suggestion/:week/:day">
          {(params) => <SuggestionPage params={params} />}
        </Route>

        <Route path="/week/:week/complete">
          {(params) => <WeeklyCompletionPage params={params} />}
        </Route>

        <Route path="/reflections" component={ReflectionHistoryPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/final-celebration" component={FinalCelebrationPage} />
        <Route path="/about-creator" component={AboutCreatorPage} />
        <Route path="/feedback" component={FeedbackListPage} />
        <Route path="/admin" component={AdminDashboard} />

        {/* Legacy route */}
        <Route path="/celebrate">
          <Redirect to="/dashboard" />
        </Route>

        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn("Missing Google Analytics key: VITE_GA_MEASUREMENT_ID");
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

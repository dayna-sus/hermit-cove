import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CrabProgress from "@/components/crab-progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertUser, User } from "@shared/schema";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);
  const { toast } = useToast();

  const createUserMutation = useMutation({
    mutationFn: async (userData: InsertUser): Promise<User> => {
      const res = await apiRequest("POST", "/api/users", userData);
      return res.json();
    },
    onSuccess: (user) => {
      // Store user ID in localStorage for session persistence
      localStorage.setItem("hermitCoveUserId", user.id);
      navigate("/dashboard");
      toast({
        title: "Welcome to Hermit Cove! 🌊",
        description: "Your journey begins now. Take it one wave at a time.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBeginJourney = () => {
    setShowNameInput(true);
  };

  const handleContinueJourney = () => {
    const userId = localStorage.getItem("hermitCoveUserId");
    if (userId) {
      navigate("/dashboard");
    } else {
      toast({
        title: "No saved progress found",
        description: "Start a new journey to begin your transformation.",
      });
    }
  };

  const handleStartJourney = () => {
    if (!userName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to begin your journey.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate({
      name: userName.trim(),
      currentWeek: 1,
      currentSuggestion: 1,
      completedSuggestions: 0,
    });
  };

  return (
    <div className="min-h-screen wave-pattern">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="text-6xl wave-motion">🐚</span>
              <h1 
                className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
                data-testid="app-title"
              >
                Hermit Cove
              </h1>
              <span className="text-6xl wave-motion">🌊</span>
            </div>
            <p 
              className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              data-testid="app-description"
            >
              A gentle 6-week journey to help you emerge from your shell and overcome social anxiety, one small step at a time.
            </p>
          </header>

          {/* Hero Section */}
          <Card className="rounded-3xl p-8 md:p-12 shadow-lg border border-border mb-12">
            <CardContent className="p-0">
              <div className="flex items-center justify-center mb-8">
                <CrabProgress completedSuggestions={0} size="xl" showProgress={false} />
              </div>
              
              <h2 
                className="text-2xl md:text-3xl font-semibold text-foreground mb-6"
                data-testid="hero-title"
              >
                Ready to Begin Your Transformation?
              </h2>
              <p 
                className="text-muted-foreground mb-8 max-w-xl mx-auto"
                data-testid="hero-subtitle"
              >
                Join thousands who have successfully overcome social anxiety through our gentle, research-backed approach.
              </p>

              {/* Name Input Form */}
              {showNameInput && (
                <div className="max-w-md mx-auto mb-8 p-6 bg-muted/30 rounded-2xl">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                    What should we call you? 🌊
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name..."
                    className="mb-4"
                    data-testid="input-name"
                    onKeyDown={(e) => e.key === 'Enter' && handleStartJourney()}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={handleStartJourney}
                      disabled={createUserMutation.isPending}
                      className="flex-1"
                      data-testid="button-start-journey"
                    >
                      {createUserMutation.isPending ? "Starting..." : "Start My Journey 🦀"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowNameInput(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!showNameInput && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Button
                    onClick={handleBeginJourney}
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold"
                    data-testid="button-begin-journey"
                  >
                    🌟 Begin Your Journey
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleContinueJourney}
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold"
                    data-testid="button-continue-journey"
                  >
                    📍 Continue Your Journey
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 border border-border shadow-sm">
              <CardContent className="p-0 text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="font-semibold text-foreground mb-2">6 Weeks</h3>
                <p className="text-muted-foreground text-sm">Self-paced journey with weekly milestones</p>
              </CardContent>
            </Card>
            <Card className="p-6 border border-border shadow-sm">
              <CardContent className="p-0 text-center">
                <div className="text-4xl mb-4">💭</div>
                <h3 className="font-semibold text-foreground mb-2">42 Suggestions</h3>
                <p className="text-muted-foreground text-sm">Practical exercises to build confidence</p>
              </CardContent>
            </Card>
            <Card className="p-6 border border-border shadow-sm">
              <CardContent className="p-0 text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="font-semibold text-foreground mb-2">AI Support</h3>
                <p className="text-muted-foreground text-sm">Encouraging responses to your reflections</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import CrabProgress from "@/components/crab-progress";
import ConfettiCelebration from "@/components/confetti-celebration";
import { COURSE_WEEKS, getCrabStageFromProgress } from "@/lib/course-data";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, WeeklyCompletion } from "@shared/schema";

interface WeeklyCompletionPageProps {
  params: {
    week: string;
  };
}

export default function WeeklyCompletionPage({ params }: WeeklyCompletionPageProps) {
  const [, navigate] = useLocation();
  const [weeklyReflection, setWeeklyReflection] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const week = parseInt(params.week);

  // Initialize user and show confetti
  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    if (!storedUserId) {
      navigate("/");
      return;
    }
    setUserId(storedUserId);
    
    // Show confetti on load
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 4000);
  }, [navigate]);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: weeklyCompletion, isLoading: completionLoading } = useQuery<WeeklyCompletion>({
    queryKey: ["/api/users", userId, "weeks", week, "completion"],
    enabled: !!userId && !!week,
  });

  // Set existing reflection if available
  useEffect(() => {
    if (weeklyCompletion?.reflection && !weeklyReflection) {
      setWeeklyReflection(weeklyCompletion.reflection);
    }
  }, [weeklyCompletion, weeklyReflection]);

  const submitWeeklyCompletionMutation = useMutation({
    mutationFn: async (reflectionData: { reflection: string }) => {
      if (!userId) throw new Error("No user ID");
      
      const res = await apiRequest("POST", `/api/users/${userId}/complete-week`, {
        week,
        reflection: reflectionData.reflection,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "weeks", week, "completion"] });
      toast({
        title: "Week reflection saved! 🌊",
        description: "Your progress has been celebrated and recorded.",
      });
    },
  });

  const isLoading = userLoading || completionLoading;

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-3xl">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-3xl text-center">
          <Card className="p-8">
            <CardContent>
              <p className="text-muted-foreground">Unable to load user data.</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-4">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user has completed this week
  const weeklyCompletedSuggestions = week * 7;
  const hasCompletedWeek = user.completedSuggestions >= weeklyCompletedSuggestions;

  if (!hasCompletedWeek) {
    return (
      <div className="min-h-screen wave-pattern p-4 pb-24">
        <div className="container mx-auto max-w-3xl text-center">
          <Card className="p-8">
            <CardContent>
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Week {week} not yet complete
              </h2>
              <p className="text-muted-foreground mb-6">
                Complete all suggestions in Week {week} to unlock this celebration.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const weekData = COURSE_WEEKS.find(w => w.week === week);
  const crabStage = getCrabStageFromProgress(user.completedSuggestions);
  const progressPercent = (user.completedSuggestions / 42) * 100;

  const handleSaveReflection = () => {
    if (!weeklyReflection.trim()) {
      toast({
        title: "Reflection required",
        description: "Please share your thoughts about this week before saving.",
        variant: "destructive",
      });
      return;
    }

    submitWeeklyCompletionMutation.mutate({ reflection: weeklyReflection.trim() });
  };

  const handleContinue = () => {
    if (week >= 6 || user.completedSuggestions >= 42) {
      navigate("/final-celebration");
    } else {
      navigate("/dashboard");
    }
  };


  return (
    <>
      <ConfettiCelebration isActive={showConfetti} />
      
      <div className="min-h-screen wave-pattern p-4 pb-24">
        <div className="container mx-auto max-w-3xl">
          <Card className="rounded-3xl p-8 md:p-12 border border-border shadow-xl">
            <CardContent className="p-0 text-center">
              {/* Celebration Header */}
              <div className="mb-8">
                <div className="text-8xl mb-4 float-animation">🎉</div>
                <h2 
                  className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                  data-testid="celebration-title"
                >
                  Congratulations! 🌊
                </h2>
                <h3 
                  className="text-xl text-primary mb-6"
                  data-testid="week-completion-subtitle"
                >
                  You've completed Week {week}!
                </h3>
                <p 
                  className="text-xl text-muted-foreground mb-6"
                  data-testid="week-title"
                >
                  {weekData?.title} - Complete! ✨
                </p>
              </div>

              {/* Progress Visualization */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 mb-8">
                <h4 
                  className="text-lg font-semibold text-foreground mb-4"
                  data-testid="emergence-title"
                >
                  Your Crab is Emerging! 🦀
                </h4>
                
                <div className="mb-6">
                  <CrabProgress 
                    completedSuggestions={user.completedSuggestions} 
                    size="xl" 
                    showProgress={false}
                  />
                </div>
                
                <p 
                  className="text-muted-foreground mb-4"
                  data-testid="progress-description"
                >
                  {crabStage.description} - You're {Math.round(progressPercent)}% of the way out of your shell!
                </p>
                
                <div className="max-w-md mx-auto">
                  <Progress 
                    value={progressPercent} 
                    className="h-4"
                    data-testid="completion-progress-bar"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Start</span>
                    <span>{user.completedSuggestions}/42 suggestions</span>
                    <span>Freedom</span>
                  </div>
                </div>
              </div>

              {/* Weekly Reflection */}
              <div className="text-left bg-muted/30 rounded-2xl p-6 mb-8">
                <Label 
                  htmlFor="weekly-reflection"
                  className="block font-semibold text-foreground mb-3 flex items-center gap-2"
                >
                  <span>📝</span> Week {week} Reflection
                </Label>
                <p className="text-muted-foreground text-sm mb-4">
                  Take a moment to reflect on your progress this week. What did you learn about yourself?
                </p>
                <Textarea
                  id="weekly-reflection"
                  value={weeklyReflection}
                  onChange={(e) => setWeeklyReflection(e.target.value)}
                  placeholder="Share your thoughts about this week's journey..."
                  className="min-h-24 mb-4"
                  data-testid="textarea-weekly-reflection"
                />
                
                {!weeklyCompletion?.reflection && (
                  <Button
                    onClick={handleSaveReflection}
                    disabled={submitWeeklyCompletionMutation.isPending || !weeklyReflection.trim()}
                    variant="outline"
                    data-testid="button-save-reflection"
                  >
                    {submitWeeklyCompletionMutation.isPending ? "Saving..." : "Save Reflection"}
                  </Button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleContinue}
                  size="lg"
                  className="px-8 py-4 text-lg font-semibold"
                  data-testid="button-continue-journey"
                >
                  {week >= 6 || user.completedSuggestions >= 42 
                    ? "🎊 Grand Finale!" 
                    : `Continue to Week ${week + 1} 🌊`
                  }
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate("/journal")}
                  size="lg"
                  className="px-6 py-4 text-lg font-medium"
                  data-testid="button-view-journal"
                >
                  View Journal Entries 📚
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  size="lg"
                  className="px-6 py-4 text-lg font-medium"
                  data-testid="button-back-to-hermit-cove"
                >
                  🏠 Back to Hermit Cove
                </Button>
              </div>

              {/* Week Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="text-2xl font-bold text-foreground" data-testid="week-suggestions-completed">
                    7
                  </div>
                  <div className="text-xs text-muted-foreground">Suggestions</div>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="text-2xl font-bold text-foreground" data-testid="week-number">
                    {week}
                  </div>
                  <div className="text-xs text-muted-foreground">Week</div>
                </div>
                <div className="bg-card rounded-lg p-4 border border-border">
                  <div className="text-2xl font-bold text-foreground" data-testid="total-progress">
                    {Math.round(progressPercent)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Complete</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

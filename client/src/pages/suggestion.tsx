import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Suggestion, UserReflection, User } from "@shared/schema";

interface SuggestionPageProps {
  params: {
    week: string;
    day: string;
  };
}

export default function SuggestionPage({ params }: SuggestionPageProps) {
  const [, navigate] = useLocation();
  const [reflection, setReflection] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const week = parseInt(params.week);
  const day = parseInt(params.day);

  // All hooks must be called before any early returns
  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    if (!storedUserId) {
      navigate("/");
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  const { data: suggestion, isLoading: suggestionLoading } = useQuery<Suggestion>({
    queryKey: ["/api/suggestions/week", week, "day", day],
    enabled: !!week && !!day,
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: existingReflection, isLoading: reflectionLoading } = useQuery<UserReflection>({
    queryKey: ["/api/reflections", userId, suggestion?.id],
    enabled: !!userId && !!suggestion?.id,
  });

  const submitReflectionMutation = useMutation({
    mutationFn: async (reflectionData: { reflection: string }) => {
      if (!suggestion || !userId) throw new Error("Missing data");
      
      const res = await apiRequest("/api/reflections", {
        method: "POST",
        body: {
          userId,
          suggestionId: suggestion.id,
          reflection: reflectionData.reflection,
          completed: false,
        }
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reflections", userId, suggestion?.id] });
    },
  });

  const completeSuggestionMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !suggestion) throw new Error("Missing data");
      
      const res = await apiRequest(`/api/users/${userId}/complete-suggestion`, {
        method: "POST",
        body: {
          suggestionId: suggestion.id,
        }
      });
      return res;
    },
    onSuccess: async (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      
      // Navigate based on what we just completed and the updated user progress
      if (day >= 7) {
        // Just completed last day of week - go to week completion page
        navigate(`/week/${week}/complete`);
      } else {
        // Go to next day in current week
        navigate(`/suggestion/${week}/${day + 1}`);
      }
      
      toast({
        title: "Suggestion completed! 🦀",
        description: "Great progress! Keep swimming forward.",
      });
    },
  });

  // Set reflection from existing data and clear when changing suggestions
  useEffect(() => {
    if (existingReflection?.reflection) {
      setReflection(existingReflection.reflection);
    } else {
      setReflection("");
    }
  }, [existingReflection, suggestion?.id]);

  const isLoading = suggestionLoading || reflectionLoading;

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-8">
            <CardContent>
              <p className="text-muted-foreground">Suggestion not found.</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-4">
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user has access to this suggestion
  const userCanAccess = user && (
    (user.currentWeek > week) ||
    (user.currentWeek === week && user.currentSuggestion >= day)
  );

  if (!userCanAccess) {
    return (
      <div className="min-h-screen wave-pattern p-4 pb-24">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-8">
            <CardContent>
              <div className="text-6xl mb-4">🔒</div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                This suggestion is locked
              </h2>
              <p className="text-muted-foreground mb-6">
                Complete your current suggestions to unlock this one.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Go back to main page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }


  const handleCompleteAndContinue = async () => {
    if (!existingReflection?.reflection && !reflection.trim()) {
      toast({
        title: "Reflection required",
        description: "Please write a reflection before completing this suggestion.",
        variant: "destructive",
      });
      return;
    }

    // If there's a new reflection that hasn't been submitted, submit it first to get AI encouragement
    if (reflection.trim() && reflection !== existingReflection?.reflection) {
      try {
        await submitReflectionMutation.mutateAsync({ reflection: reflection.trim() });
      } catch (error) {
        console.error("Failed to submit reflection:", error);
        // Continue with completion even if reflection submission fails
      }
    }

    completeSuggestionMutation.mutate();
  };

  return (
    <div className="min-h-screen wave-pattern p-4 pb-24">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <div className="flex-1">
            <h1 
              className="text-2xl font-bold text-foreground"
              data-testid="page-title"
            >
              Week {week}, Day {day}
            </h1>
            <p className="text-muted-foreground" data-testid="suggestion-category">
              {suggestion.category} • {suggestion.title}
            </p>
          </div>
        </div>

        {/* Main Suggestion Card */}
        <Card className="rounded-2xl mb-6 border border-border shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-6">
              <span className="text-3xl">💡</span>
              <div className="flex-1">
                <h2 
                  className="text-xl font-semibold text-foreground mb-3"
                  data-testid="suggestion-title"
                >
                  {suggestion.title}
                </h2>
                <p 
                  className="text-foreground/80 leading-relaxed mb-6"
                  data-testid="suggestion-description"
                >
                  {suggestion.description}
                </p>
                
                {/* Reflection Area */}
                <div className="bg-card rounded-xl p-6 border border-border">
                  <div className="mb-4">
                    <Label 
                      htmlFor="reflection" 
                      className="block text-lg font-semibold text-foreground mb-2"
                    >
                      📝 After completing this activity...
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Come back here and write about your experience. What happened? How did you feel? What did you learn?
                    </p>
                  </div>
                  <Textarea
                    id="reflection"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Example: I tried the breathing exercise and noticed my shoulders were tense. It felt a bit awkward at first, but then I started to relax..."
                    className="min-h-32 mb-4"
                    data-testid="textarea-reflection"
                  />
                  
                  
                  {/* AI Response */}
                  {existingReflection?.aiResponse && (
                    <div 
                      className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary mb-4"
                      data-testid="ai-response-container"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">🤖</span>
                        <div>
                          <p className="text-sm font-medium text-foreground mb-1">
                            AI Encouragement
                          </p>
                          <p 
                            className="text-sm text-foreground/80"
                            data-testid="ai-response-text"
                          >
                            {existingReflection.aiResponse}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {existingReflection?.completed ? (
                      <Button
                        onClick={() => {
                          // Navigate to next suggestion or week completion
                          if (day >= 7) {
                            navigate(`/week/${week}/complete`);
                          } else {
                            navigate(`/suggestion/${week}/${day + 1}`);
                          }
                        }}
                        data-testid="button-continue-journey"
                      >
                        Continue Journey 🌊
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCompleteAndContinue}
                        disabled={completeSuggestionMutation.isPending}
                        data-testid="button-complete-suggestion"
                      >
                        {completeSuggestionMutation.isPending 
                          ? "Completing..." 
                          : "Mark Complete & Continue 🌊"
                        }
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      data-testid="button-back-to-main"
                    >
                      Go back to main page
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => {
              if (day > 1) {
                navigate(`/suggestion/${week}/${day - 1}`);
              } else if (week > 1) {
                navigate(`/suggestion/${week - 1}/7`);
              } else {
                navigate("/dashboard");
              }
            }}
            disabled={week === 1 && day === 1}
            data-testid="button-previous"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Suggestion {((week - 1) * 7) + day} of 42
            </p>
            <div className="w-32 bg-muted rounded-full h-2 mt-1">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(((week - 1) * 7) + day) / 42 * 100}%` }}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => {
              if (day < 7) {
                navigate(`/suggestion/${week}/${day + 1}`);
              } else if (week < 6) {
                navigate(`/suggestion/${week + 1}/1`);
              }
            }}
            disabled={week === 6 && day === 7}
            data-testid="button-next"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

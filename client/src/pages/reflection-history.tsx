import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { User, UserReflection, Suggestion } from "@shared/schema";
import { Calendar, BookOpen, ArrowLeft } from "lucide-react";

interface EnrichedReflection extends UserReflection {
  suggestion: Suggestion | null;
}

export default function ReflectionHistoryPage() {
  const [, navigate] = useLocation();
  const [userId, setUserId] = useState<string | null>(null);

  // Initialize user
  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    if (!storedUserId) {
      navigate("/");
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: reflections, isLoading: reflectionsLoading } = useQuery<EnrichedReflection[]>({
    queryKey: ["/api/users", userId, "reflections"],
    enabled: !!userId,
  });

  const isLoading = userLoading || reflectionsLoading;

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-4xl text-center">
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

  // Group reflections by week
  const reflectionsByWeek: { [week: number]: EnrichedReflection[] } = {};
  (reflections || []).forEach(reflection => {
    if (reflection.suggestion) {
      const week = reflection.suggestion.week;
      if (!reflectionsByWeek[week]) {
        reflectionsByWeek[week] = [];
      }
      reflectionsByWeek[week].push(reflection);
    }
  });

  // Sort weeks in descending order
  const weeks = Object.keys(reflectionsByWeek)
    .map(Number)
    .sort((a, b) => b - a);

  const totalReflections = reflections?.length || 0;
  const totalPossible = user?.completedSuggestions || 0;
  const progress = totalPossible > 0 ? (totalReflections / totalPossible) * 100 : 0;

  return (
    <div className="min-h-screen wave-pattern p-4 pb-24">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4 text-muted-foreground hover:text-foreground"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
              <BookOpen className="w-8 h-8 text-primary" />
              Your Reflection Journey
            </h1>
            <p className="text-muted-foreground mb-6">
              Revisit your daily reflections and see how far you've come
            </p>
            
            {/* Progress Overview */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Daily Reflections</span>
                  <span className="text-sm text-muted-foreground">
                    {totalReflections} reflections written
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reflections */}
        {weeks.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reflections yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your first daily suggestion to start building your reflection history.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Continue Your Journey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {weeks.map((week) => {
              const weekReflections = reflectionsByWeek[week].sort((a, b) => 
                (a.suggestion?.day || 0) - (b.suggestion?.day || 0)
              );
              
              return (
                <div key={week} className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Week {week}
                  </h3>
                  
                  <div className="space-y-4">
                    {weekReflections.map((reflection) => (
                      <Card key={reflection.id} className="overflow-hidden" data-testid={`reflection-${reflection.id}`}>
                        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 pb-3">
                          <CardTitle className="flex items-center justify-between">
                            <div>
                              <h4 className="text-lg font-bold">
                                Day {reflection.suggestion?.day}: {reflection.suggestion?.title}
                              </h4>
                              <p className="text-sm text-muted-foreground font-normal">
                                {reflection.suggestion?.category} • {new Date(reflection.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="bg-muted/30 rounded-lg p-4">
                              <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                <span>📝</span> Your Reflection
                              </h5>
                              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                {reflection.reflection}
                              </p>
                            </div>
                            
                            {reflection.aiResponse && (
                              <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                                <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                  <span>🦀</span> AI Encouragement
                                </h5>
                                <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                  {reflection.aiResponse}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/suggestion/${reflection.suggestion?.week}/${reflection.suggestion?.day}`)}
                                data-testid={`button-view-day-${reflection.suggestion?.week}-${reflection.suggestion?.day}`}
                              >
                                View This Day →
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {totalReflections > 0 && user && user.completedSuggestions < 42 && (
          <Card className="mt-8 text-center">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Keep Growing! 🌱</h3>
              <p className="text-muted-foreground mb-4">
                You're making great progress. Continue your journey to build more reflections.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Continue Your Journey
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Final message for completed course */}
        {user && user.completedSuggestions >= 42 && (
          <Card className="mt-8 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">🎉 Journey Complete!</h3>
              <p className="text-muted-foreground mb-4">
                You've completed all 6 weeks and built an amazing collection of reflections. 
                Take pride in how much you've grown!
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/final-celebration")}>
                  View Celebration
                </Button>
                <Button variant="outline" onClick={() => navigate("/journal")}>
                  View Journal
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
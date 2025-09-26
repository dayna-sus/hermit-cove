import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { COURSE_WEEKS } from "@/lib/course-data";
import type { User, WeeklyCompletion } from "@shared/schema";
import { Calendar, BookOpen, ArrowLeft } from "lucide-react";

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

  const { data: weeklyCompletions, isLoading: completionsLoading } = useQuery<WeeklyCompletion[]>({
    queryKey: ["/api/users", userId, "weekly-completions"],
    enabled: !!userId,
  });

  const isLoading = userLoading || completionsLoading;

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

  const completedWeeks = weeklyCompletions || [];
  const totalWeeks = 6;
  const progress = (completedWeeks.length / totalWeeks) * 100;

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
              Revisit your weekly reflections and see how far you've come
            </p>
            
            {/* Progress Overview */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Reflection Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedWeeks.length} of {totalWeeks} weeks
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reflections */}
        {completedWeeks.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent>
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reflections yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete your first week to start building your reflection history.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Continue Your Journey
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {completedWeeks.map((completion) => {
              const weekData = COURSE_WEEKS.find(w => w.week === completion.week);
              
              return (
                <Card key={completion.id} className="overflow-hidden" data-testid={`reflection-week-${completion.week}`}>
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                    <CardTitle className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold">
                          Week {completion.week}: {weekData?.title || "Journey Progress"}
                        </h3>
                        <p className="text-sm text-muted-foreground font-normal">
                          Completed on {new Date(completion.completedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {completion.reflection ? (
                      <div className="space-y-4">
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <span>📝</span> Your Reflection
                          </h4>
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {completion.reflection}
                          </p>
                        </div>
                        
                        {weekData?.description && (
                          <div className="text-sm text-muted-foreground">
                            <p className="font-medium mb-2">Week Focus:</p>
                            <p>{weekData.description}</p>
                          </div>
                        )}
                        
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/week/${completion.week}/complete`)}
                            data-testid={`button-view-week-${completion.week}`}
                          >
                            View Week Details
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        <p>Week completed without a reflection</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        {completedWeeks.length > 0 && completedWeeks.length < totalWeeks && (
          <Card className="mt-8 text-center">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Keep Growing! 🌱</h3>
              <p className="text-muted-foreground mb-4">
                You're making great progress. Continue your journey to unlock more reflections.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Continue to Week {completedWeeks.length + 1}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Final message for completed course */}
        {completedWeeks.length === totalWeeks && (
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
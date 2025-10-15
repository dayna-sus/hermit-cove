import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, BookOpen, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { UserReflection, Suggestion } from "@shared/schema";

interface EnrichedReflection extends UserReflection {
  suggestion: Suggestion | null;
}

export default function AllReflectionsPage() {
  const [, navigate] = useLocation();
  const userId = localStorage.getItem("hermitCoveUserId");

  const { data: reflections, isLoading } = useQuery<EnrichedReflection[]>({
    queryKey: ["/api/users", userId, "reflections"],
    enabled: !!userId,
  });

  if (!userId) {
    navigate("/");
    return null;
  }

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
              All Your Reflections
            </h1>
            <p className="text-muted-foreground">
              Every thought and experience from your journey
            </p>
          </div>
        </div>

        {/* Reflections List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-48 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reflections && reflections.length > 0 ? (
          <div className="space-y-6">
            {reflections.map((reflection) => (
              <Card 
                key={reflection.id} 
                className="overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`reflection-card-${reflection.id}`}
              >
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <CardTitle className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {reflection.suggestion && (
                        <>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Week {reflection.suggestion.week}, Day {reflection.suggestion.day}
                            </span>
                            <span className="text-xs">•</span>
                            <span className="text-xs">
                              {format(new Date(reflection.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <h3 
                            className="text-lg font-bold text-foreground"
                            data-testid={`reflection-title-${reflection.id}`}
                          >
                            {reflection.suggestion.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reflection.suggestion.category}
                          </p>
                        </>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* User's Reflection */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                      <span>📝</span> Your Reflection
                    </h4>
                    <p 
                      className="text-foreground/90 leading-relaxed whitespace-pre-wrap"
                      data-testid={`reflection-text-${reflection.id}`}
                    >
                      {reflection.reflection}
                    </p>
                  </div>

                  {/* AI Encouragement */}
                  {reflection.aiResponse && (
                    <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
                      <h4 className="font-semibold text-foreground mb-2">
                        AI Encouragement
                      </h4>
                      <p 
                        className="text-foreground/80 leading-relaxed"
                        data-testid={`ai-response-${reflection.id}`}
                      >
                        {reflection.aiResponse}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {reflection.suggestion && (
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/suggestion/${reflection.suggestion!.week}/${reflection.suggestion!.day}`)}
                        data-testid={`button-view-day-${reflection.id}`}
                      >
                        View This Day →
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12">
            <CardContent>
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No reflections yet</h3>
              <p className="text-muted-foreground mb-6">
                Start your journey and complete daily suggestions to build your reflection collection.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Start Your Journey
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

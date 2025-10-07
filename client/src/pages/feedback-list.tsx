import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { Feedback } from "@shared/schema";

export default function FeedbackListPage() {
  const [, navigate] = useLocation();

  const { data: feedbackList, isLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
  });

  return (
    <div className="min-h-screen wave-pattern p-4 pb-24">
      <div className="container mx-auto max-w-5xl">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/about-creator")}
            className="flex items-center gap-2"
            data-testid="button-back-about"
          >
            ← Back to About
          </Button>
        </div>

        <Card className="rounded-3xl p-8 md:p-12 border border-border shadow-xl">
          <CardHeader className="p-0 mb-8">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                User Feedback
              </CardTitle>
              <p className="text-lg text-muted-foreground mt-2">
                All feedback from Hermit Cove users
              </p>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-6 border rounded-xl">
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : feedbackList && feedbackList.length > 0 ? (
              <div className="space-y-4">
                {feedbackList.map((feedback) => (
                  <Card 
                    key={feedback.id} 
                    className="border-2 border-primary/20 hover:border-primary/40 transition-colors"
                    data-testid={`feedback-item-${feedback.id}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                          <p 
                            className="text-foreground leading-relaxed flex-1 whitespace-pre-wrap"
                            data-testid={`feedback-message-${feedback.id}`}
                          >
                            {feedback.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span data-testid={`feedback-date-${feedback.id}`}>
                            📅 {format(new Date(feedback.createdAt), "PPpp")}
                          </span>
                          {feedback.userAgent && (
                            <span 
                              className="text-xs truncate max-w-md"
                              data-testid={`feedback-useragent-${feedback.id}`}
                            >
                              🖥️ {feedback.userAgent}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12" data-testid="no-feedback">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-xl text-muted-foreground">
                  No feedback yet
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Feedback submitted by users will appear here
                </p>
              </div>
            )}

            {feedbackList && feedbackList.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Total feedback received: <span className="font-semibold text-foreground">{feedbackList.length}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

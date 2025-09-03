import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CrabProgress from "@/components/crab-progress";
import ConfettiCelebration from "@/components/confetti-celebration";
import { useToast } from "@/hooks/use-toast";
import type { User, JournalEntry } from "@shared/schema";

export default function FinalCelebrationPage() {
  const [, navigate] = useLocation();
  const [userId, setUserId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    if (!storedUserId) {
      navigate("/");
      return;
    }
    setUserId(storedUserId);
    
    // Show extended confetti celebration
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 8000);
  }, [navigate]);

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: journalEntries, isLoading: journalLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/users", userId, "journal"],
    enabled: !!userId,
  });

  const isLoading = userLoading || journalLoading;

  if (!userId) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-96 w-full" />
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
                Go back to main page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user has actually completed the full journey
  if (user.completedSuggestions < 42) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-8">
            <CardContent>
              <div className="text-6xl mb-4">🦀</div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Journey in Progress
              </h2>
              <p className="text-muted-foreground mb-6">
                Complete all 42 suggestions to unlock the grand celebration!
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Current progress: {user.completedSuggestions}/42 suggestions completed
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

  const journalCount = journalEntries?.length || 0;
  const daysSinceStart = user.createdAt ? Math.ceil((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 42;

  return (
    <>
      <ConfettiCelebration isActive={showConfetti} duration={8000} />
      
      <div className="min-h-screen wave-pattern p-4 pb-24">
        <div className="container mx-auto max-w-4xl">
          <Card className="rounded-3xl p-8 md:p-12 border border-border shadow-2xl bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
            <CardContent className="p-0 text-center">
              {/* Celebration Header */}
              <div className="mb-12">
                <div className="text-8xl mb-6 float-animation" data-testid="celebration-emoji">🎉</div>
                <h1 
                  className="text-4xl md:text-5xl font-bold text-foreground mb-4"
                  data-testid="celebration-main-title"
                >
                  You Did It! 🦀✨
                </h1>
                <h2 
                  className="text-2xl md:text-3xl text-primary mb-6"
                  data-testid="celebration-subtitle"
                >
                  Welcome to Your New Out-of-Shell Life!
                </h2>
                <p 
                  className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                  data-testid="celebration-description"
                >
                  After 6 weeks and 42 challenges, you've completely emerged from your shell. 
                  You are no longer the same person who started this journey.
                </p>
              </div>

              {/* Fully Emerged Crab */}
              <div className="bg-gradient-to-br from-accent to-secondary rounded-3xl p-8 mb-12 shadow-lg">
                <CrabProgress 
                  completedSuggestions={42} 
                  size="xl" 
                  showProgress={false}
                />
                <h3 
                  className="text-2xl font-bold text-foreground mb-2 mt-4"
                  data-testid="emergence-title"
                >
                  Fully Emerged!
                </h3>
                <p 
                  className="text-muted-foreground"
                  data-testid="emergence-description"
                >
                  Your confidence has grown, your fears have shrunk, and your social world has expanded.
                </p>
              </div>

              {/* Journey Statistics */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                <Card className="rounded-2xl p-6 border border-border">
                  <CardContent className="p-0 text-center">
                    <div className="text-3xl mb-2">📈</div>
                    <div 
                      className="text-2xl font-bold text-foreground"
                      data-testid="final-suggestions-count"
                    >
                      42
                    </div>
                    <div className="text-sm text-muted-foreground">Suggestions Completed</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl p-6 border border-border">
                  <CardContent className="p-0 text-center">
                    <div className="text-3xl mb-2">📝</div>
                    <div 
                      className="text-2xl font-bold text-foreground"
                      data-testid="final-journal-count"
                    >
                      {journalCount}
                    </div>
                    <div className="text-sm text-muted-foreground">Journal Entries</div>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl p-6 border border-border">
                  <CardContent className="p-0 text-center">
                    <div className="text-3xl mb-2">🔥</div>
                    <div 
                      className="text-2xl font-bold text-foreground"
                      data-testid="final-journey-days"
                    >
                      {daysSinceStart}
                    </div>
                    <div className="text-sm text-muted-foreground">Days of Growth</div>
                  </CardContent>
                </Card>
              </div>

              {/* Final AI Message */}
              <div className="bg-primary/5 rounded-2xl p-8 mb-8 border-l-4 border-primary">
                <div className="flex items-start gap-4 text-left">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <h4 
                      className="font-semibold text-foreground mb-3"
                      data-testid="final-ai-title"
                    >
                      Final Encouragement
                    </h4>
                    <p 
                      className="text-foreground/80 leading-relaxed"
                      data-testid="final-ai-message"
                    >
                      What an incredible transformation! You've proven to yourself that social anxiety doesn't define you. 
                      You have the tools, the confidence, and the courage to continue growing. Remember, every conversation, 
                      every connection, every moment of bravery has led you here. Keep swimming forward! 🌊💙
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Growth Summary */}
              <div className="bg-gradient-to-br from-secondary/20 to-accent/20 rounded-2xl p-8 mb-8">
                <h4 
                  className="text-xl font-semibold text-foreground mb-4"
                  data-testid="growth-summary-title"
                >
                  Your Transformation Journey 🌊
                </h4>
                <div className="grid md:grid-cols-2 gap-6 text-left">
                  <div>
                    <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <span>🐚</span> You Started With:
                    </h5>
                    <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                      <li>Fear of social interactions</li>
                      <li>Avoidance of group settings</li>
                      <li>Self-doubt and anxiety</li>
                      <li>Limited comfort zone</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <span>🦀</span> You Now Have:
                    </h5>
                    <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
                      <li>Social confidence and skills</li>
                      <li>Comfort in group environments</li>
                      <li>Self-awareness and resilience</li>
                      <li>An expanded comfort zone</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8 w-full max-w-4xl mx-auto">
                <Button
                  size="lg"
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-3 text-base sm:text-lg font-semibold"
                  onClick={() => {
                    toast({
                      title: "Coming Soon! 🚀",
                      description: "The advanced course is being developed. Stay tuned for more challenges!",
                      duration: 4000,
                    });
                  }}
                  data-testid="button-new-journey"
                >
                  🔄 Start Advanced Course
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-3 text-base sm:text-lg font-semibold"
                  onClick={() => {
                    const shareText = `I just completed the Hermit Cove social anxiety recovery course! 🦀✨ 42 challenges completed and feeling confident! #HermitCove #SocialAnxietyRecovery #PersonalGrowth`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Hermit Cove Success!',
                        text: shareText,
                        url: window.location.origin
                      });
                    } else {
                      navigator.clipboard.writeText(shareText);
                      toast({
                        title: "Copied to clipboard! 📋",
                        description: "Share your success story with others!",
                      });
                    }
                  }}
                  data-testid="button-share-success"
                >
                  📱 Share Your Success
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-3 text-base sm:text-lg font-semibold"
                  onClick={() => navigate("/journal")}
                  data-testid="button-view-journals"
                >
                  📚 View All Journals
                </Button>
              </div>

              {/* Motivational Footer */}
              <div className="bg-muted/30 rounded-2xl p-6">
                <h4 
                  className="font-semibold text-foreground mb-2"
                  data-testid="motivational-title"
                >
                  The Ocean Awaits 🌊
                </h4>
                <p 
                  className="text-muted-foreground text-sm"
                  data-testid="motivational-message"
                >
                  Your journey doesn't end here. You now have the tools and confidence to navigate any social situation. 
                  The world is your ocean, and you're no longer hiding in your shell. Go forth and make waves! 🦀💙
                </p>
              </div>

              {/* Achievement Badges */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs font-medium text-foreground">Course</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
                  <div className="text-2xl mb-1">💪</div>
                  <div className="text-xs font-medium text-foreground">Confidence</div>
                  <div className="text-xs text-muted-foreground">Builder</div>
                </div>
                <div className="bg-accent/10 rounded-xl p-4 border border-accent/20">
                  <div className="text-2xl mb-1">🌊</div>
                  <div className="text-xs font-medium text-foreground">Wave</div>
                  <div className="text-xs text-muted-foreground">Maker</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900 rounded-xl p-4 border border-green-200 dark:border-green-800">
                  <div className="text-2xl mb-1">🦀</div>
                  <div className="text-xs font-medium text-foreground">Shell</div>
                  <div className="text-xs text-muted-foreground">Breaker</div>
                </div>
              </div>

              {/* Personal Message */}
              <div className="mt-8 text-lg text-primary font-medium" data-testid="personal-message">
                Congratulations, {user.name}! You are officially shell-free! 🐚➡️🦀
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

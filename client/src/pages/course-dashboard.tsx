import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import CrabProgress from "@/components/crab-progress";
import { COURSE_WEEKS, getCrabStageFromProgress } from "@/lib/course-data";
import type { User, Suggestion } from "@shared/schema";

export default function CourseDashboard() {
  const [, navigate] = useLocation();
  const [userId, setUserId] = useState<string | null>(null);

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

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const isLoading = userLoading || suggestionsLoading;


  if (isLoading) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-6xl">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !suggestions) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-6xl text-center">
          <Card className="p-8">
            <CardContent>
              <p className="text-muted-foreground">Unable to load your progress. Please try again.</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                Return Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progressPercent = (user.completedSuggestions / 42) * 100;
  const crabStage = getCrabStageFromProgress(user.completedSuggestions);
  const currentWeekData = COURSE_WEEKS.find(w => w.week === user.currentWeek);
  
  const currentWeekSuggestions = suggestions.filter(s => s.week === user.currentWeek);
  const isWeekComplete = user.currentSuggestion > 7;

  const handleContinueJourney = () => {
    // If user has completed all suggestions for current week but currentSuggestion is still 7,
    // they should go to week completion page
    if (isWeekComplete || user.currentSuggestion > 7) {
      navigate(`/week/${user.currentWeek}/complete`);
    } else {
      navigate(`/suggestion/${user.currentWeek}/${user.currentSuggestion}`);
    }
  };

  return (
    <div className="min-h-screen wave-pattern p-4 pb-24">
      <div className="container mx-auto max-w-6xl">
        {/* Progress Header */}
        <Card className="rounded-3xl p-6 mb-8 border border-border shadow-lg">
          <CardContent className="p-0">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 
                  className="text-2xl font-bold text-foreground mb-2"
                  data-testid="progress-title"
                >
                  Your Journey Progress
                </h2>
                <p 
                  className="text-muted-foreground"
                  data-testid="progress-subtitle"
                >
                  Week {user.currentWeek} of 6 • {user.completedSuggestions} of 42 suggestions completed
                </p>
              </div>
              <div className="text-right">
                <CrabProgress 
                  completedSuggestions={user.completedSuggestions} 
                  size="lg" 
                  showProgress={false}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {crabStage.description}
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-6">
              <Progress 
                value={progressPercent} 
                className="h-3"
                data-testid="overall-progress-bar"
              />
            </div>
            
            {/* Crab Emergence Stages */}
            <div className="flex justify-between items-center overflow-x-auto">
              {[
                { emoji: "🐚", label: "Shell", progress: 0 },
                { emoji: "👀", label: "Eyes", progress: 16.67 },
                { emoji: "🦀", label: "Claws", progress: 33.33 },
                { emoji: "🦵", label: "Legs", progress: 50 },
                { emoji: "🦀", label: "Body", progress: 66.67 },
                { emoji: "🦀", label: "Almost", progress: 83.33 },
                { emoji: "🎉", label: "Freedom", progress: 100 },
              ].map((stage, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center gap-1 min-w-0 flex-shrink-0"
                  data-testid={`stage-${index}`}
                >
                  <span 
                    className={`text-lg sm:text-2xl transition-opacity ${
                      progressPercent >= stage.progress ? 'opacity-100' : 'opacity-30'
                    }`}
                  >
                    {stage.emoji}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{stage.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Week Content */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl p-6 border border-border shadow-sm mb-6">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{currentWeekData?.emoji}</span>
                  <h3 
                    className="text-xl font-semibold text-foreground"
                    data-testid="current-week-title"
                  >
                    Week {user.currentWeek}: {currentWeekData?.title}
                  </h3>
                </div>
                
                <p 
                  className="text-muted-foreground mb-6"
                  data-testid="current-week-description"
                >
                  {currentWeekData?.description}
                </p>
                
                {/* Weekly Progress */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                  {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                    const isCompleted = user.currentSuggestion > day || user.completedSuggestions >= (user.currentWeek - 1) * 7 + day;
                    const isCurrent = user.currentSuggestion === day && !isWeekComplete;
                    const isLocked = user.currentSuggestion < day && !isWeekComplete;
                    
                    return (
                      <div
                        key={day}
                        className={`
                          rounded-lg p-2 sm:p-3 text-center font-medium transition-colors
                          ${isCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : isCurrent 
                            ? 'bg-accent text-accent-foreground border-2 border-primary' 
                            : 'bg-muted text-muted-foreground'
                          }
                        `}
                        data-testid={`day-${day}`}
                      >
                        <div className="text-xs mb-1">Day {day}</div>
                        <div className="text-sm sm:text-lg">
                          {isCompleted ? '✓' : isCurrent ? '📝' : isLocked ? '🔒' : '🏆'}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Current Status */}
                <div className="text-center">
                  {isWeekComplete ? (
                    <div className="bg-gradient-to-br from-accent/30 to-secondary/30 rounded-2xl p-6">
                      <h4 className="font-semibold text-foreground mb-2">Week Complete! 🎉</h4>
                      <p className="text-foreground/80 mb-4">
                        Congratulations on completing Week {user.currentWeek}! Time to celebrate your progress.
                      </p>
                      <Button
                        onClick={handleContinueJourney}
                        size="lg"
                        data-testid="button-view-celebration"
                      >
                        View Celebration 🏆
                      </Button>
                    </div>
                  ) : user.completedSuggestions >= 42 ? (
                    <div className="bg-gradient-to-br from-primary/30 to-accent/30 rounded-2xl p-6">
                      <h4 className="font-semibold text-foreground mb-2">Journey Complete! 🎊</h4>
                      <p className="text-foreground/80 mb-4">
                        You've completed all 42 suggestions! You've fully emerged from your shell.
                      </p>
                      <Button
                        onClick={() => navigate("/final-celebration")}
                        size="lg"
                        data-testid="button-final-celebration"
                      >
                        Grand Celebration 🦀✨
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-accent/30 to-secondary/30 rounded-2xl p-6">
                      <h4 className="font-semibold text-foreground mb-2">Continue Your Journey</h4>
                      <p className="text-foreground/80 mb-4">
                        Ready for Day {user.currentSuggestion} of Week {user.currentWeek}?
                      </p>
                      <Button
                        onClick={handleContinueJourney}
                        size="lg"
                        data-testid="button-continue-suggestion"
                      >
                        Continue Journey 🌊
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="rounded-2xl p-6 border border-border shadow-sm">
              <CardContent className="p-0">
                <h3 
                  className="font-semibold text-foreground mb-4 flex items-center gap-2"
                  data-testid="stats-title"
                >
                  <span>📊</span> Your Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Suggestions Completed</span>
                    <span 
                      className="font-semibold text-foreground"
                      data-testid="stats-completed"
                    >
                      {user.completedSuggestions}/42
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Current Week</span>
                    <span 
                      className="font-semibold text-foreground"
                      data-testid="stats-week"
                    >
                      Week {user.currentWeek}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground text-sm">Progress</span>
                    <span 
                      className="font-semibold text-foreground"
                      data-testid="stats-progress"
                    >
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="rounded-2xl p-6 border border-border shadow-sm">
              <CardContent className="p-0">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>⚡</span> Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/")}
                    data-testid="button-go-to-landing"
                  >
                    🐚 Back to Home
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate("/journal")}
                    data-testid="button-quick-journal"
                  >
                    📝 Write in Journal
                  </Button>
                  {user.completedSuggestions >= 7 && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate("/celebrate")}
                      data-testid="button-quick-celebrate"
                    >
                      🎉 View Celebrations
                    </Button>
                  )}
                  {user.completedSuggestions > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => navigate(`/suggestion/${user.currentWeek}/${Math.max(1, user.currentSuggestion - 1)}`)}
                      data-testid="button-quick-review"
                    >
                      👀 Review Previous
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Overview */}
            <Card className="rounded-2xl p-6 border border-border shadow-sm">
              <CardContent className="p-0">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span>🗓️</span> All Weeks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {COURSE_WEEKS.map((week) => {
                    const weekCompleted = user.completedSuggestions >= week.week * 7;
                    const weekInProgress = user.currentWeek === week.week;
                    const weekLocked = user.currentWeek < week.week;
                    
                    return (
                      <div
                        key={week.week}
                        className={`
                          flex items-center justify-between p-3 rounded-lg transition-colors
                          ${weekCompleted 
                            ? 'bg-primary/10 border border-primary/20' 
                            : weekInProgress 
                            ? 'bg-accent/20 border-2 border-primary' 
                            : 'bg-muted/50'
                          }
                        `}
                        data-testid={`week-overview-${week.week}`}
                      >
                        <span className={`text-sm font-medium ${weekLocked ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {week.emoji} Week {week.week}: {week.title}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          weekCompleted 
                            ? 'bg-primary text-primary-foreground' 
                            : weekInProgress 
                            ? 'bg-accent text-accent-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {weekCompleted ? 'Complete ✓' : weekInProgress ? 'In Progress' : 'Locked 🔒'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { JournalEntry, User } from "@shared/schema";

const MOOD_OPTIONS = [
  { value: "great", label: "😊 Great", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" },
  { value: "good", label: "😌 Good", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100" },
  { value: "okay", label: "😐 Okay", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" },
  { value: "struggling", label: "😔 Struggling", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100" },
];

export default function JournalPage() {
  const [, navigate] = useLocation();
  const [newEntryContent, setNewEntryContent] = useState("");
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    if (!storedUserId) {
      navigate("/");
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: journalEntries, isLoading: entriesLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/users", userId, "journal"],
    enabled: !!userId,
  });

  const createEntryMutation = useMutation({
    mutationFn: async (entryData: { content: string; mood?: string }) => {
      if (!userId) throw new Error("No user ID");
      
      const res = await apiRequest("/api/journal", {
        method: "POST",
        body: {
          userId,
          content: entryData.content,
          mood: entryData.mood,
          week: user?.currentWeek,
          day: user?.currentSuggestion,
        }
      });
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId, "journal"] });
      setNewEntryContent("");
      setSelectedMood("");
      
      toast({
        title: "Journal entry saved! 📖",
        description: "Your thoughts have been captured.",
      });
    },
  });

  if (!userId) {
    return null;
  }

  if (entriesLoading) {
    return (
      <div className="min-h-screen wave-pattern p-4">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-8 w-64 mb-8" />
          <Skeleton className="h-64 w-full mb-8" />
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const handleCreateEntry = () => {
    if (!newEntryContent.trim()) {
      toast({
        title: "Content required",
        description: "Please write something before saving your journal entry.",
        variant: "destructive",
      });
      return;
    }

    createEntryMutation.mutate({
      content: newEntryContent.trim(),
      mood: selectedMood || undefined,
    });
  };

  const getMoodOption = (mood: string) => {
    return MOOD_OPTIONS.find(option => option.value === mood) || MOOD_OPTIONS[2];
  };

  return (
    <div className="min-h-screen wave-pattern p-4 pb-24">
      <div className="container mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            data-testid="button-back-home"
          >
            🐚 Back to Home
          </Button>
        </div>

        {/* Journal Header */}
        <div className="text-center mb-8">
          <h2 
            className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3"
            data-testid="journal-title"
          >
            <span className="text-4xl">📖</span>
            Your Journey Journal
            <span className="text-4xl">🌊</span>
          </h2>
          <p 
            className="text-muted-foreground max-w-2xl mx-auto"
            data-testid="journal-subtitle"
          >
            Capture your thoughts, feelings, and breakthrough moments as you emerge from your shell.
          </p>
        </div>

        {/* New Entry Section */}
        <Card className="rounded-2xl p-6 border border-border shadow-sm mb-8">
          <CardContent className="p-0">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <span>✨</span> New Journal Entry
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="block text-sm font-medium text-foreground mb-2">
                  How are you feeling today?
                </Label>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {MOOD_OPTIONS.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={selectedMood === mood.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMood(mood.value)}
                      className="text-sm"
                      data-testid={`mood-${mood.value}`}
                    >
                      {mood.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="journal-content" className="sr-only">
                  Journal entry content
                </Label>
                <Textarea
                  id="journal-content"
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                  placeholder="Write about your experiences, feelings, or any breakthrough moments..."
                  className="min-h-32"
                  data-testid="textarea-journal-entry"
                />
              </div>
              <Button
                onClick={handleCreateEntry}
                disabled={createEntryMutation.isPending || !newEntryContent.trim()}
                data-testid="button-save-entry"
              >
                {createEntryMutation.isPending ? "Saving..." : "Save Entry 🐚"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Previous Entries */}
        <div className="space-y-6">
          <h3 
            className="text-xl font-semibold text-foreground flex items-center gap-2"
            data-testid="previous-entries-title"
          >
            <span>📚</span> Previous Entries
          </h3>
          
          {!journalEntries || journalEntries.length === 0 ? (
            <Card className="rounded-2xl p-8 border border-border shadow-sm">
              <CardContent className="p-0 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  No journal entries yet
                </h4>
                <p className="text-muted-foreground">
                  Start writing to track your journey and growth over time.
                </p>
              </CardContent>
            </Card>
          ) : (
            journalEntries.map((entry) => {
              const moodOption = entry.mood ? getMoodOption(entry.mood) : null;
              
              return (
                <Card 
                  key={entry.id} 
                  className="journal-card rounded-2xl p-6 border border-border shadow-sm"
                  data-testid={`journal-entry-${entry.id}`}
                >
                  <CardContent className="p-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div 
                          className="text-sm text-muted-foreground"
                          data-testid="entry-date"
                        >
                          {format(new Date(entry.createdAt), "MMMM d, yyyy • h:mm a")}
                          {entry.week && entry.day && (
                            <span className="ml-2">
                              • Week {entry.week}, Day {entry.day}
                            </span>
                          )}
                        </div>
                        {moodOption && (
                          <Badge 
                            variant="secondary" 
                            className={`mt-1 ${moodOption.color}`}
                            data-testid="entry-mood"
                          >
                            {moodOption.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div 
                      className="text-foreground/80 leading-relaxed whitespace-pre-wrap"
                      data-testid="entry-content"
                    >
                      {entry.content}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Encouragement Message */}
        {journalEntries && journalEntries.length > 0 && (
          <Card className="rounded-2xl p-6 border border-border shadow-sm mt-8 bg-primary/5">
            <CardContent className="p-0 text-center">
              <div className="text-4xl mb-3">🌊</div>
              <h4 className="font-semibold text-foreground mb-2">
                Keep Writing, Keep Growing
              </h4>
              <p className="text-muted-foreground text-sm">
                Every entry is a step forward in your journey. Your thoughts matter, and your growth is remarkable. 🦀✨
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

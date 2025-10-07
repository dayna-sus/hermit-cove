import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AboutCreatorPage() {
  const [, navigate] = useLocation();
  const [feedback, setFeedback] = useState("");
  const { toast } = useToast();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackText: string) => {
      const res = await apiRequest("/api/feedback", {
        method: "POST",
        body: { message: feedbackText }
      });
      return res;
    },
    onSuccess: () => {
      setFeedback("");
      toast({
        title: "Thank you! 🙏",
        description: "Your feedback has been sent successfully. I appreciate you taking the time to share your thoughts!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send feedback. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) {
      toast({
        title: "Message required",
        description: "Please enter your feedback before submitting.",
        variant: "destructive",
      });
      return;
    }
    submitFeedbackMutation.mutate(feedback.trim());
  };

  return (
    <div className="min-h-screen wave-pattern p-4 pb-24">
      <div className="container mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
            data-testid="button-back-home"
          >
            🐚 Back to Home
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/feedback")}
            className="flex items-center gap-2"
            data-testid="button-view-feedback"
          >
            💬 View All Feedback
          </Button>
        </div>

        <Card className="rounded-3xl p-8 md:p-12 border border-border shadow-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👋</div>
              <h1 
                className="text-3xl md:text-4xl font-bold text-foreground mb-4"
                data-testid="creator-title"
              >
                About the Creator
              </h1>
              <p 
                className="text-lg text-muted-foreground"
                data-testid="creator-subtitle"
              >
                The story behind Hermit Cove
              </p>
            </div>

            {/* Creator Story */}
            <div className="bg-primary/5 rounded-2xl p-6 md:p-8 mb-8 border-l-4 border-primary">
              <div className="flex items-start gap-4 text-left">
                <span className="text-3xl">🦀</span>
                <div>
                  <h2 
                    className="text-xl font-semibold text-foreground mb-4"
                    data-testid="creator-story-title"
                  >
                    My Journey with Social Anxiety
                  </h2>
                  <div className="space-y-4 text-foreground/80 leading-relaxed">
                    <p data-testid="creator-story-p1">
                      Like many of you, I suffer from social anxiety. For years, I found myself hiding in my own shell, 
                      avoiding social situations and missing out on meaningful connections and opportunities.
                    </p>
                    <p data-testid="creator-story-p2">
                      I decided to create Hermit Cove not only to help myself work through these challenges, but also to 
                      help others who are facing similar struggles. This app represents my own journey of emerging from 
                      my shell, one small step at a time.
                    </p>
                    <p data-testid="creator-story-p3">
                      I hope you enjoyed your journey through the 6-week program and found it helpful in your own growth. 
                      Every feature, every suggestion, and every encouragement was designed with empathy and understanding 
                      from someone who truly gets it.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-secondary/20 rounded-2xl p-6 md:p-8 mb-8">
              <h2 
                className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2"
                data-testid="feedback-title"
              >
                <span>💬</span> Your Feedback Matters
              </h2>
              <div className="space-y-4 text-foreground/80 leading-relaxed">
                <p data-testid="feedback-p1">
                  Your feedback is crucial to making Hermit Cove even better. I appreciate every comment, suggestion, 
                  and story you're willing to share. It helps me understand what's working and what can be improved 
                  to make this app more helpful for future users.
                </p>
                <p data-testid="feedback-p2">
                  Thank you for being a part of my journey. Your courage to start this program and work on your 
                  social anxiety inspires me to keep improving and expanding Hermit Cove.
                </p>
                <p 
                  className="font-medium text-foreground"
                  data-testid="feedback-p3"
                >
                  I look forward to hearing from you!
                </p>
              </div>
            </div>

            {/* Feedback Form */}
            <div className="bg-gradient-to-br from-primary/15 via-secondary/15 to-accent/15 rounded-3xl p-8 md:p-10 border-2 border-primary/20 shadow-xl relative overflow-hidden">
              {/* Decorative background elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full translate-y-12 -translate-x-12"></div>
              
              <div className="relative z-10">
                <div className="text-center mb-2">
                  <div className="text-4xl mb-3">💬✨</div>
                </div>
                <h2 
                  className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                  data-testid="feedback-form-title"
                >
                  Share Your Feedback
                </h2>
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                </div>
                <p 
                  className="text-foreground/80 mb-8 text-center text-lg font-medium"
                  data-testid="feedback-form-description"
                >
                  Your insights and suggestions are invaluable for enhancing the Hermit Cove experience for future users
                </p>
              </div>
              
              <div className="max-w-2xl mx-auto relative z-10">
                <Label 
                  htmlFor="feedback-message" 
                  className="text-base font-semibold text-foreground mb-3 block"
                >
                  Your thoughts, suggestions, or comments:
                </Label>
                <Textarea
                  id="feedback-message"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience with the app, suggestions for improvement, or any thoughts you'd like me to know..."
                  className="min-h-32 mb-6 resize-none border-2 border-primary/30 focus:border-primary/60 bg-background/80 backdrop-blur-sm shadow-lg"
                  data-testid="feedback-textarea"
                  disabled={submitFeedbackMutation.isPending}
                />
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={handleSubmitFeedback}
                    disabled={submitFeedbackMutation.isPending || !feedback.trim()}
                    className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg transform hover:scale-105 transition-all duration-200"
                    data-testid="button-submit-feedback"
                  >
                    {submitFeedbackMutation.isPending ? "Sending..." : "🚀 Send Feedback"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setFeedback("")}
                    disabled={submitFeedbackMutation.isPending}
                    className="px-8 py-3 text-lg font-semibold border-2 border-primary/30 hover:border-primary/60 shadow-md"
                    data-testid="button-clear-feedback"
                  >
                    Clear
                  </Button>
                </div>
                
                <p 
                  className="text-sm text-muted-foreground mt-6 text-center font-medium"
                  data-testid="feedback-privacy-note"
                >
                  Your feedback will be sent directly to the creator. Thank you for helping improve Hermit Cove! 🦀
                </p>
              </div>
            </div>

            {/* Gratitude Section */}
            <div className="text-center mt-8 pt-8 border-t border-border">
              <div className="text-4xl mb-3">🙏</div>
              <h3 
                className="text-lg font-semibold text-foreground mb-2"
                data-testid="gratitude-title"
              >
                Thank You
              </h3>
              <p 
                className="text-muted-foreground"
                data-testid="gratitude-message"
              >
                For taking the brave step to work on your social anxiety and for being part of the Hermit Cove community
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
export const COURSE_WEEKS = [
  {
    week: 1,
    title: "Building Awareness",
    description: "Start by understanding your social anxiety patterns and triggers",
    theme: "awareness",
    emoji: "🌊"
  },
  {
    week: 2,
    title: "Understanding Your Comfort Zone",
    description: "Explore the boundaries of your comfort zone with gentle exercises",
    theme: "comfort",
    emoji: "🐚"
  },
  {
    week: 3,
    title: "Small Interactions",
    description: "Practice brief, low-pressure social interactions",
    theme: "interaction",
    emoji: "💬"
  },
  {
    week: 4,
    title: "Group Settings",
    description: "Build confidence in group environments",
    theme: "group",
    emoji: "👥"
  },
  {
    week: 5,
    title: "Deeper Connections",
    description: "Form more meaningful relationships and conversations",
    theme: "connection",
    emoji: "💙"
  },
  {
    week: 6,
    title: "Confidence & Growth",
    description: "Embrace your social confidence and plan for continued growth",
    theme: "confidence",
    emoji: "✨"
  }
];

export const CRAB_STAGES = [
  { stage: 0, emoji: "🐚", description: "Hidden in shell", progress: 0 },
  { stage: 1, emoji: "👀", description: "Eyes peeking out", progress: 16.67 },
  { stage: 2, emoji: "🦀", description: "Claws showing", progress: 33.33 },
  { stage: 3, emoji: "🦵", description: "Legs emerging", progress: 50 },
  { stage: 4, emoji: "🦀", description: "Half emerged", progress: 66.67 },
  { stage: 5, emoji: "🦀", description: "Almost free", progress: 83.33 },
  { stage: 6, emoji: "🦀", description: "Fully emerged!", progress: 100 }
];

export function getCrabStageFromProgress(completedSuggestions: number): typeof CRAB_STAGES[0] {
  const progressPercent = (completedSuggestions / 42) * 100;
  
  if (progressPercent >= 100) return CRAB_STAGES[6];
  if (progressPercent >= 83.33) return CRAB_STAGES[5];
  if (progressPercent >= 66.67) return CRAB_STAGES[4];
  if (progressPercent >= 50) return CRAB_STAGES[3];
  if (progressPercent >= 33.33) return CRAB_STAGES[2];
  if (progressPercent >= 16.67) return CRAB_STAGES[1];
  
  return CRAB_STAGES[0];
}

export function getWeekFromSuggestionNumber(suggestionNumber: number): number {
  return Math.min(Math.ceil(suggestionNumber / 7), 6);
}

export function getDayFromSuggestionNumber(suggestionNumber: number): number {
  const day = ((suggestionNumber - 1) % 7) + 1;
  return Math.min(day, 7);
}

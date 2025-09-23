import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

interface EncouragementResponse {
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  encouragementLevel: 'gentle' | 'moderate' | 'strong';
}

// Array of varied fallback encouragement messages
const fallbackMessages: EncouragementResponse[] = [
  {
    message: "Thank you for sharing your experience. Remember, growth happens one wave at a time. You're braver than you know! 🌊🦀",
    sentiment: 'neutral',
    encouragementLevel: 'moderate'
  },
  {
    message: "Every small step you take creates ripples of positive change. Your courage is inspiring! 🐚✨",
    sentiment: 'positive',
    encouragementLevel: 'gentle'
  },
  {
    message: "Like a crab slowly emerging from its shell, you're discovering your own strength. Keep going! 🦀🌊",
    sentiment: 'positive',
    encouragementLevel: 'moderate'
  },
  {
    message: "The ocean doesn't rush its waves, and you don't need to rush your journey. You're exactly where you need to be. 🌊💙",
    sentiment: 'neutral',
    encouragementLevel: 'gentle'
  },
  {
    message: "Each challenge you face is like a shell being polished by the waves - you're becoming more beautiful with every experience. 🐚⭐",
    sentiment: 'positive',
    encouragementLevel: 'moderate'
  },
  {
    message: "Your reflection shows real insight and growth. The tide is turning in your favor! 🌊🦀",
    sentiment: 'positive',
    encouragementLevel: 'strong'
  },
  {
    message: "Progress isn't always visible on the surface, just like the powerful currents beneath calm waters. Trust your journey. 🌊✨",
    sentiment: 'neutral',
    encouragementLevel: 'moderate'
  },
  {
    message: "You're building confidence like a coral reef - slowly but surely, creating something strong and beautiful. 🐚🌊",
    sentiment: 'positive',
    encouragementLevel: 'gentle'
  },
  {
    message: "Every experience, comfortable or challenging, adds to your treasure chest of wisdom. Well done! ⭐🦀",
    sentiment: 'positive',
    encouragementLevel: 'moderate'
  },
  {
    message: "Like the steady rhythm of waves on shore, your consistent effort is creating lasting change. Keep flowing forward! 🌊💙",
    sentiment: 'positive',
    encouragementLevel: 'strong'
  },
  {
    message: "You're navigating these waters with such grace. Even when the sea feels choppy, you keep swimming forward. 🐟⚓",
    sentiment: 'neutral',
    encouragementLevel: 'moderate'
  },
  {
    message: "What a beautiful step you've taken! Like a lighthouse beam cutting through fog, your courage illuminates the path ahead. 🌊✨",
    sentiment: 'positive',
    encouragementLevel: 'strong'
  },
  {
    message: "Your willingness to try is like a pearl forming in an oyster - pressure creating something precious. 🐚⭐",
    sentiment: 'positive',
    encouragementLevel: 'moderate'
  },
  {
    message: "Sometimes the most important journeys happen beneath the surface. You're doing the deep work that truly matters. 🌊🐙",
    sentiment: 'neutral',
    encouragementLevel: 'gentle'
  },
  {
    message: "Like a seasoned sailor reading the winds, you're learning to understand your own patterns and responses. Brilliant! ⚓🌊",
    sentiment: 'positive',
    encouragementLevel: 'strong'
  },
  {
    message: "Your honest reflection is like sunlight dancing on water - bringing clarity and beauty to your experience. 🌊✨",
    sentiment: 'positive',
    encouragementLevel: 'gentle'
  },
  {
    message: "Even the mightiest whale started as something small. Your growth might feel gradual, but it's profound. 🐟🌊",
    sentiment: 'neutral',
    encouragementLevel: 'moderate'
  },
  {
    message: "You're collecting experiences like sea glass - each one shaped by the waves into something uniquely beautiful. 🐚💎",
    sentiment: 'positive',
    encouragementLevel: 'moderate'
  },
  {
    message: "The way you're facing your fears reminds me of a brave captain steering through a storm. You've got this! ⚓🌊",
    sentiment: 'positive',
    encouragementLevel: 'strong'
  },
  {
    message: "Like tides that return twice daily, your courage shows up again and again. That consistency is powerful. 🌊🦀",
    sentiment: 'positive',
    encouragementLevel: 'moderate'
  }
];

function getRandomFallbackEncouragement(): EncouragementResponse {
  const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
  return fallbackMessages[randomIndex];
}

// Array of varied journal encouragement messages
const journalFallbackMessages: string[] = [
  "Thank you for sharing your thoughts. Every reflection brings you closer to shore. 🐚✨",
  "Your words show deep self-awareness. Like shells on the beach, each thought has its own beauty. 🌊🐚",
  "Writing helps the waves of emotion find their natural rhythm. Keep expressing yourself! 💙⭐",
  "Your journal is a safe harbor for your thoughts. Thank you for being honest with yourself. 🦀🌊",
  "Each entry is like a message in a bottle - precious and meaningful. Your journey matters. 🐚💫",
  "The tides of feeling ebb and flow, and you're learning to navigate them beautifully. 🌊✨",
  "Your reflections are creating ripples of positive change in your life. Keep writing! 🦀💙",
  "Like a lighthouse guiding ships, your self-awareness lights the way forward. 🌊⭐",
  "Every word you write is a step on the path to understanding yourself better. Well done! 🐚🦀",
  "Your openness is like the ocean - vast, deep, and full of possibilities. 🌊💙",
  "What a gift you're giving yourself by taking time to reflect. Your thoughts are like treasures washing up on shore. 🐚⚓",
  "Your journal entries are becoming a map of your inner landscape. Each word charts new territory. 🌊🗺️",
  "Like a pearl diver exploring the depths, you're discovering gems within your own experience. 💎🌊",
  "The courage to write honestly about your feelings is like steering a ship through both calm and stormy seas. 🦀⚓",
  "Your words flow like a gentle current, carrying insights from the depths to the surface. Beautiful work! 🌊✨",
  "Every entry adds another layer to your story, like sediment creating beautiful underwater caves. 🐚🌊",
  "Writing these thoughts takes the bravery of a deep-sea explorer. You're discovering new parts of yourself! 🐙💙",
  "Your journal is becoming a lighthouse of self-understanding, guiding you through life's waters. ⚓✨",
  "Like a seasoned sailor reading the weather, you're learning to understand your own emotional patterns. 🌊🦀",
  "The way you capture your experiences reminds me of an artist painting the constantly changing sea. 🎨🌊",
  "Your honesty flows like a natural spring feeding into the ocean of self-knowledge. Keep writing! 💙🐚",
  "Each word you write is like a small wave, and together they're creating powerful tides of change. 🌊⭐"
];

function getRandomJournalFallback(): string {
  const randomIndex = Math.floor(Math.random() * journalFallbackMessages.length);
  return journalFallbackMessages[randomIndex];
}

export async function generateEncouragement(
  reflection: string,
  suggestionDescription: string
): Promise<EncouragementResponse> {
  try {
    // Vary the prompt style for more diverse responses
    const promptVariations = [
      `You are a warm, marine-biologist-turned-therapist helping someone with social anxiety. They just completed a challenge and shared their reflection.

Challenge: "${suggestionDescription}"
User Reflection: "${reflection}"

Create a response that:
1. Celebrates their specific efforts (2-3 sentences)
2. Uses ocean/marine metaphors naturally 
3. Acknowledges both struggles and victories
4. Includes marine emojis (🌊, 🐚, 🦀, ⭐, 🐙, 🌊, 🐟, ⚓)

Provide sentiment analysis and encouragement level. Respond in JSON: {"message": "", "sentiment": "", "encouragementLevel": ""}`,

      `You are an encouraging lighthouse keeper who guides people through social anxiety recovery. They just shared their experience.

Challenge: "${suggestionDescription}"
User Reflection: "${reflection}"

Respond like a wise, caring mentor who:
1. Sees the courage in their action (2-3 sentences)
2. Connects their experience to ocean imagery
3. Offers perspective on their growth journey
4. Uses thoughtful marine emojis (🌊, 🐚, 🦀, ⭐, 🌊)

Include sentiment and encouragement analysis. JSON format: {"message": "", "sentiment": "", "encouragementLevel": ""}`,

      `You are a gentle sea captain helping someone navigate social anxiety waters. They just completed a challenge.

Challenge: "${suggestionDescription}"
User Reflection: "${reflection}"

Craft an encouraging message that:
1. Honors their bravery in facing the challenge (2-3 sentences)
2. Uses varied sea/ocean analogies 
3. Validates their unique experience and feelings
4. Includes diverse marine emojis (🌊, 🐚, 🦀, ⭐, 🐙, 🐟, ⚓)

Analyze sentiment and encouragement needs. Return JSON: {"message": "", "sentiment": "", "encouragementLevel": ""}`
    ];

    const selectedPrompt = promptVariations[Math.floor(Math.random() * promptVariations.length)];

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: selectedPrompt }],
      response_format: { type: "json_object" },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      message: result.message || "You're doing great! Every step forward is progress, no matter how small. 🌊✨",
      sentiment: result.sentiment || 'neutral',
      encouragementLevel: result.encouragementLevel || 'moderate'
    };
  } catch (error) {
    console.error('Failed to generate encouragement:', error);
    // Fallback encouragement with variety
    return getRandomFallbackEncouragement();
  }
}

export async function generateJournalEncouragement(
  journalContent: string,
  mood: string
): Promise<string> {
  try {
    // Vary journal encouragement prompts for more diversity
    const journalPromptVariations = [
      `You are a gentle ocean therapist who helps people process their emotions through journaling. 

Journal Entry: "${journalContent}"
Current Mood: ${mood}

Respond with 1-2 sentences that:
- Honor their emotional honesty and courage in writing
- Use flowing ocean metaphors and imagery
- Include varied marine emojis (🌊, 🐚, 🦀, ⭐, 🐙, 🌸, ⚓)
- Match their mood with appropriate warmth and support`,

      `You are a wise sea turtle who has seen many emotional tides come and go. Someone just shared their journal thoughts.

Journal Content: "${journalContent}"
Their Mood: ${mood}

Offer 1-2 sentences of encouragement that:
- Validates their experience with gentle wisdom
- Uses marine and ocean-based language naturally
- Includes thoughtful sea emojis (🌊, 🐚, 🦀, ⭐, 🐟, 🌊)
- Provides comfort appropriate to their emotional state`,

      `You are a caring lighthouse keeper whose light guides people through emotional storms and calm seas alike.

Journal Writing: "${journalContent}"
Feeling: ${mood}

Provide 1-2 sentences that:
- Acknowledge their bravery in self-reflection
- Use lighthouse and ocean metaphors organically  
- Include diverse marine emojis (🌊, 🐚, 🦀, ⭐, ⚓, 🐙)
- Offer hope and understanding based on their mood`
    ];

    const selectedJournalPrompt = journalPromptVariations[Math.floor(Math.random() * journalPromptVariations.length)];

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: selectedJournalPrompt }],
      max_tokens: 150,
    });

    return response.choices[0].message.content || "Your journey is unique and valuable. Keep flowing forward like the gentle tide. 🌊💙";
  } catch (error) {
    console.error('Failed to generate journal encouragement:', error);
    return getRandomJournalFallback();
  }
}

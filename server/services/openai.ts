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
  "Your openness is like the ocean - vast, deep, and full of possibilities. 🌊💙"
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
    const prompt = `You are a supportive AI therapist helping someone overcome social anxiety. They just completed a social anxiety challenge and shared their reflection.

Challenge: "${suggestionDescription}"
User Reflection: "${reflection}"

Analyze their reflection and provide:
1. An encouraging response (2-3 sentences, warm and supportive)
2. Sentiment analysis of their reflection (positive, negative, or neutral)
3. How much encouragement they need (gentle, moderate, or strong)

Use marine-themed emojis (🌊, 🐚, 🦀, ⭐) and maintain a gentle, ocean-inspired tone. 
Be specific about their progress and validate their feelings, whether positive or challenging.

Respond in JSON format: {
  "message": "encouraging response here",
  "sentiment": "positive/negative/neutral",
  "encouragementLevel": "gentle/moderate/strong"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
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
    const prompt = `You are a supportive AI companion for someone on a social anxiety recovery journey. They just wrote a journal entry.

Journal Entry: "${journalContent}"
Mood: ${mood}

Provide a brief (1-2 sentences), encouraging response that:
- Acknowledges their feelings and experiences
- Offers gentle support and validation
- Uses marine-themed language and emojis (🌊, 🐚, 🦀, ⭐)
- Matches their emotional state appropriately

Keep it warm, authentic, and supportive.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 150,
    });

    return response.choices[0].message.content || "Your journey is unique and valuable. Keep flowing forward like the gentle tide. 🌊💙";
  } catch (error) {
    console.error('Failed to generate journal encouragement:', error);
    return getRandomJournalFallback();
  }
}

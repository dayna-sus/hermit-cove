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
    // Fallback encouragement
    return {
      message: "Thank you for sharing your experience. Remember, growth happens one wave at a time. You're braver than you know! 🌊🦀",
      sentiment: 'neutral',
      encouragementLevel: 'moderate'
    };
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
    return "Thank you for sharing your thoughts. Every reflection brings you closer to shore. 🐚✨";
  }
}

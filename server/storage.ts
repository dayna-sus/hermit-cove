import { 
  type User, 
  type InsertUser, 
  type Suggestion, 
  type InsertSuggestion,
  type UserReflection, 
  type InsertUserReflection,
  type JournalEntry, 
  type InsertJournalEntry,
  type WeeklyCompletion, 
  type InsertWeeklyCompletion,
  users,
  suggestions,
  userReflections,
  journalEntries,
  weeklyCompletions
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Suggestion operations
  getSuggestion(id: string): Promise<Suggestion | undefined>;
  getSuggestionByWeekAndDay(week: number, day: number): Promise<Suggestion | undefined>;
  getAllSuggestions(): Promise<Suggestion[]>;
  createSuggestion(suggestion: InsertSuggestion): Promise<Suggestion>;
  
  // User reflection operations
  getUserReflection(userId: string, suggestionId: string): Promise<UserReflection | undefined>;
  getUserReflections(userId: string): Promise<UserReflection[]>;
  createUserReflection(reflection: InsertUserReflection): Promise<UserReflection>;
  updateUserReflection(id: string, updates: Partial<UserReflection>): Promise<UserReflection | undefined>;
  
  // Journal operations
  getJournalEntries(userId: string): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  
  // Weekly completion operations
  getWeeklyCompletion(userId: string, week: number): Promise<WeeklyCompletion | undefined>;
  createWeeklyCompletion(completion: InsertWeeklyCompletion): Promise<WeeklyCompletion>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private suggestions: Map<string, Suggestion>;
  private userReflections: Map<string, UserReflection>;
  private journalEntries: Map<string, JournalEntry>;
  private weeklyCompletions: Map<string, WeeklyCompletion>;

  constructor() {
    this.users = new Map();
    this.suggestions = new Map();
    this.userReflections = new Map();
    this.journalEntries = new Map();
    this.weeklyCompletions = new Map();
    this.initializeCourseData();
  }

  private initializeCourseData() {
    // Initialize 6 weeks of course suggestions (42 total)
    const courseData = [
      // Week 1: Building Awareness
      { week: 1, day: 1, title: "Notice Your Breathing", description: "Take 5 minutes today to gently observe how you breathe when you're around other people. There's no need to change anything - simply notice if your breathing becomes shallow or speeds up. This gentle awareness is the first step in your journey.", category: "awareness" },
      { week: 1, day: 2, title: "Body Scan Check-in", description: "Before you enter any social space today, take a moment to check in with your body. Notice where you might be holding tension - your shoulders, jaw, or stomach - and gently allow those areas to soften and relax.", category: "awareness" },
      { week: 1, day: 3, title: "Thought Observation", description: "Today, gently capture 3 thoughts that come up before you interact with others. There's no need to judge or change these thoughts - simply notice them and see if you can spot any patterns emerging.", category: "awareness" },
      { week: 1, day: 4, title: "Comfort Zone Mapping", description: "Take some time today to map out your social comfort zone. You might draw it or make a list - whatever feels natural. Notice which social situations feel easy and welcoming, and which ones feel more challenging right now.", category: "awareness" },
      { week: 1, day: 5, title: "Anxiety Trigger Journal", description: "Carry a small notebook with you today and gently note any specific moments or situations that trigger feelings of social anxiety. This isn't about fixing anything - just building awareness of your unique patterns.", category: "awareness" },
      { week: 1, day: 6, title: "Self-Compassion Practice", description: "Today, when you catch yourself being self-critical about social moments, pause and ask: 'What would I say to a dear friend in this situation?' Offer yourself that same kindness and understanding.", category: "awareness" },
      { week: 1, day: 7, title: "Celebration Ritual", description: "You've completed your first week of awareness building! Create a meaningful way to celebrate this milestone - perhaps a favorite treat, a special activity, or simply a quiet moment to acknowledge your courage and growth.", category: "awareness" },

      // Week 2: Understanding Your Comfort Zone
      { week: 2, day: 1, title: "Smile at Yourself", description: "Find a quiet moment today to look at yourself in the mirror and offer yourself a genuine, warm smile for 30 seconds. Notice how this simple act of self-kindness feels and how it might shift your mood.", category: "comfort" },
      { week: 2, day: 2, title: "Eye Contact with Cashiers", description: "When you interact with cashiers or service workers today, practice making brief, friendly eye contact. Even just a moment of genuine human connection can feel meaningful for both of you.", category: "comfort" },
      { week: 2, day: 3, title: "Thank You Practice", description: "Today, express heartfelt gratitude to at least 3 people you encounter. Look them in the eyes as you say 'thank you' and let them feel the genuine appreciation behind your words.", category: "comfort" },
      { week: 2, day: 4, title: "Say Excuse Me", description: "When you need to pass by someone or gently get their attention today, practice saying 'excuse me' with a warm, polite tone. Add a moment of friendly eye contact to make the interaction feel more connected.", category: "comfort" },
      { week: 2, day: 5, title: "Weather Comment", description: "Strike up a small conversation today by making a casual, genuine comment about the weather to someone you encounter - perhaps a cashier, neighbor, or coworker. Keep it simple and let it flow naturally.", category: "comfort" },
      { week: 2, day: 6, title: "Compliment Someone", description: "Brighten someone's day by offering a sincere compliment. It might be about something they're wearing, their helpfulness, or any positive quality you genuinely notice. Let your authentic appreciation shine through.", category: "comfort" },
      { week: 2, day: 7, title: "Phone Call Practice", description: "Choose one moment today where you would normally send a text and make a phone call instead. Whether it's ordering food, checking store hours, or reaching out to a family member, embrace the warmth of voice-to-voice connection.", category: "comfort" },

      // Week 3: Small Interactions
      { week: 3, day: 1, title: "Ask for Help", description: "Today, practice the gentle art of asking for help. Reach out to someone for small assistance or directions - even if you already know the answer. Focus on gracefully receiving their kindness and support.", category: "interaction" },
      { week: 3, day: 2, title: "Give a Genuine Compliment", description: "Approach someone and give them a heartfelt compliment about something specific you've noticed - their work, kindness, or style. Practice both giving and receiving positive interactions.", category: "interaction" },
      { week: 3, day: 3, title: "Join a Short Conversation", description: "When you find yourself near an ongoing conversation today, listen for a natural moment to add a thoughtful comment or question. Trust your instincts about when it feels right to gently join in.", category: "interaction" },
      { week: 3, day: 4, title: "Express an Opinion", description: "Find a moment in conversation today to share a gentle opinion about something neutral - perhaps the weather, a local event, or a TV show you've watched. Let your authentic voice be heard in a comfortable way.", category: "interaction" },
      { week: 3, day: 5, title: "Ask Follow-up Questions", description: "When someone shares something with you today, show genuine curiosity by asking a thoughtful follow-up question. This beautiful habit shows you're truly listening and helps conversations flow naturally.", category: "interaction" },
      { week: 3, day: 6, title: "Share Something Personal", description: "Open up a little today by sharing something positive and personal - perhaps a hobby you enjoy, weekend plans, or something that sparks your interest. Let others see a glimpse of who you are beyond small talk.", category: "interaction" },
      { week: 3, day: 7, title: "Initiate a Conversation", description: "Take the gentle step of starting a conversation with someone new today. A warm 'How's your day going?' or similar genuine question can open the door to meaningful connection.", category: "interaction" },

      // Week 4: Group Settings
      { week: 4, day: 1, title: "Attend a Small Group", description: "Today, choose to join a small group activity - whether it's a work meeting, class, or community event. Challenge yourself to stay present for the entire experience, observing how you feel throughout.", category: "group" },
      { week: 4, day: 2, title: "Ask About Someone's Day", description: "Reach out to someone today with genuine curiosity about their experience. Ask 'How has your day been?' or 'How's everything going?' and practice the beautiful art of truly listening to their response.", category: "group" },
      { week: 4, day: 3, title: "Agree with Someone", description: "When you find yourself nodding along with someone's words today, take the step to voice your agreement out loud. A simple 'I think that's a great point' or 'I completely agree' can strengthen connections.", category: "group" },
      { week: 4, day: 4, title: "Share a Personal Recommendation", description: "Recommend something you genuinely enjoy (book, restaurant, movie, app) to someone who might appreciate it. Practice sharing your preferences with others.", category: "interaction" },
      { week: 4, day: 5, title: "Compliment the Group", description: "Acknowledge the positive energy or insights in a group setting today. Share something like 'This has been really helpful' or 'I appreciate how thoughtful everyone is being.' Your recognition can uplift the entire atmosphere.", category: "group" },
      { week: 4, day: 6, title: "Share a Resource", description: "When the moment feels right, offer something valuable to others - perhaps a helpful link, book recommendation, or useful information that relates to your conversation. Sharing your knowledge is a gift to the community.", category: "group" },
      { week: 4, day: 7, title: "Suggest a Group Activity", description: "Take initiative today by proposing a small group activity or inviting others to continue an engaging conversation over coffee or lunch. Your suggestion might be exactly what others were hoping someone would make.", category: "group" },

      // Week 5: Deeper Connections
      { week: 5, day: 1, title: "Share a Challenge", description: "Open up to someone you trust today about a challenge you're currently navigating. Share appropriately and ask for their perspective - you might be surprised by the wisdom and support they offer.", category: "connection" },
      { week: 5, day: 2, title: "Express Vulnerability", description: "Take a courageous step today by sharing something you're learning or working to improve about yourself. This kind of authentic vulnerability often creates the most meaningful connections with others.", category: "connection" },
      { week: 5, day: 3, title: "Ask About Someone's Interests", description: "Discover what lights someone up today by asking about their passions or interests. Listen with your full attention and let your genuine curiosity guide the conversation into deeper territory.", category: "connection" },
      { week: 5, day: 4, title: "Offer Support", description: "When someone shares a difficulty they're facing, extend your heart by offering specific support. A simple 'I'd be happy to help with that' or 'Would you like to talk about it?' can mean the world to someone.", category: "connection" },
      { week: 5, day: 5, title: "Share a Success", description: "Celebrate yourself today by sharing a recent win or accomplishment with someone who cares about you. Practice receiving their positive feedback gracefully and let yourself fully enjoy the moment.", category: "connection" },
      { week: 5, day: 6, title: "Make Plans", description: "Take the initiative to deepen a budding connection by suggesting specific plans together. Whether it's coffee, a walk, or attending an event, your invitation shows that you value the relationship.", category: "connection" },
      { week: 5, day: 7, title: "Express Appreciation", description: "Touch someone's heart today by telling them specifically how they've helped or positively impacted your life. Share the details of what you appreciate - your words might be exactly what they need to hear.", category: "connection" },

      // Week 6: Confidence & Growth
      { week: 6, day: 1, title: "Lead a Conversation", description: "Step into your power today by guiding a conversation toward something you're knowledgeable or passionate about. Trust that your insights and enthusiasm have value and can enrich the discussion.", category: "confidence" },
      { week: 6, day: 2, title: "Handle Disagreement", description: "When you find yourself holding a different viewpoint today, practice expressing it with respect and calm confidence. Remember that healthy disagreement can lead to richer understanding for everyone involved.", category: "confidence" },
      { week: 6, day: 3, title: "Public Speaking Moment", description: "Embrace a moment of visibility today by speaking up in a larger group setting. Whether making an announcement, asking a question in a meeting, or sharing during a presentation, let your voice be heard with confidence.", category: "confidence" },
      { week: 6, day: 4, title: "Network Intentionally", description: "Attend a networking event, social gathering, or community meeting today with the intention of making genuine connections with 2-3 new people. Approach each interaction with curiosity and openness.", category: "confidence" },
      { week: 6, day: 5, title: "Set a Boundary", description: "Honor your needs today by setting a kind but firm boundary when a situation calls for it. Use clear 'I' statements and speak with gentle directness - this is an act of self-respect.", category: "confidence" },
      { week: 6, day: 6, title: "Celebrate Your Growth", description: "Take a moment to share your incredible journey with someone you trust. Reflect on how much you've grown since beginning this program and truly acknowledge the courage and progress you've made.", category: "confidence" },
      { week: 6, day: 7, title: "Plan Your Future", description: "As you near the completion of this transformative journey, create a thoughtful plan for continuing your social growth. Set 2-3 specific, meaningful goals for the next month that will keep you moving forward with confidence.", category: "confidence" },
    ];

    courseData.forEach(data => {
      const suggestion: Suggestion = {
        id: randomUUID(),
        ...data
      };
      this.suggestions.set(suggestion.id, suggestion);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      name: insertUser.name,
      currentWeek: insertUser.currentWeek || 1,
      currentSuggestion: insertUser.currentSuggestion || 1,
      completedSuggestions: insertUser.completedSuggestions || 0,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, lastActiveAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getSuggestion(id: string): Promise<Suggestion | undefined> {
    return this.suggestions.get(id);
  }

  async getSuggestionByWeekAndDay(week: number, day: number): Promise<Suggestion | undefined> {
    return Array.from(this.suggestions.values()).find(s => s.week === week && s.day === day);
  }

  async getAllSuggestions(): Promise<Suggestion[]> {
    return Array.from(this.suggestions.values()).sort((a, b) => {
      if (a.week !== b.week) return a.week - b.week;
      return a.day - b.day;
    });
  }

  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const id = randomUUID();
    const suggestion: Suggestion = { ...insertSuggestion, id };
    this.suggestions.set(id, suggestion);
    return suggestion;
  }

  async getUserReflection(userId: string, suggestionId: string): Promise<UserReflection | undefined> {
    return Array.from(this.userReflections.values()).find(
      r => r.userId === userId && r.suggestionId === suggestionId
    );
  }

  async getUserReflections(userId: string): Promise<UserReflection[]> {
    return Array.from(this.userReflections.values()).filter(r => r.userId === userId);
  }

  async createUserReflection(insertReflection: InsertUserReflection): Promise<UserReflection> {
    const id = randomUUID();
    const reflection: UserReflection = {
      id,
      userId: insertReflection.userId,
      suggestionId: insertReflection.suggestionId,
      reflection: insertReflection.reflection,
      completed: insertReflection.completed || false,
      aiResponse: null,
      sentiment: null,
      createdAt: new Date(),
    };
    this.userReflections.set(id, reflection);
    return reflection;
  }

  async updateUserReflection(id: string, updates: Partial<UserReflection>): Promise<UserReflection | undefined> {
    const reflection = this.userReflections.get(id);
    if (!reflection) return undefined;
    
    const updatedReflection = { ...reflection, ...updates };
    this.userReflections.set(id, updatedReflection);
    return updatedReflection;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(e => e.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = randomUUID();
    const entry: JournalEntry = {
      id,
      userId: insertEntry.userId,
      content: insertEntry.content,
      mood: insertEntry.mood || null,
      week: insertEntry.week || null,
      day: insertEntry.day || null,
      createdAt: new Date(),
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async getWeeklyCompletion(userId: string, week: number): Promise<WeeklyCompletion | undefined> {
    return Array.from(this.weeklyCompletions.values()).find(
      c => c.userId === userId && c.week === week
    );
  }

  async createWeeklyCompletion(insertCompletion: InsertWeeklyCompletion): Promise<WeeklyCompletion> {
    const id = randomUUID();
    const completion: WeeklyCompletion = {
      id,
      userId: insertCompletion.userId,
      week: insertCompletion.week,
      reflection: insertCompletion.reflection || null,
      completedAt: new Date(),
    };
    this.weeklyCompletions.set(id, completion);
    return completion;
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, lastActiveAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getSuggestion(id: string): Promise<Suggestion | undefined> {
    const [suggestion] = await db.select().from(suggestions).where(eq(suggestions.id, id));
    return suggestion || undefined;
  }

  async getSuggestionByWeekAndDay(week: number, day: number): Promise<Suggestion | undefined> {
    const [suggestion] = await db
      .select()
      .from(suggestions)
      .where(and(eq(suggestions.week, week), eq(suggestions.day, day)));
    return suggestion || undefined;
  }

  async getAllSuggestions(): Promise<Suggestion[]> {
    return await db.select().from(suggestions).orderBy(suggestions.week, suggestions.day);
  }

  async createSuggestion(insertSuggestion: InsertSuggestion): Promise<Suggestion> {
    const [suggestion] = await db
      .insert(suggestions)
      .values(insertSuggestion)
      .returning();
    return suggestion;
  }

  async getUserReflection(userId: string, suggestionId: string): Promise<UserReflection | undefined> {
    const [reflection] = await db
      .select()
      .from(userReflections)
      .where(and(eq(userReflections.userId, userId), eq(userReflections.suggestionId, suggestionId)));
    return reflection || undefined;
  }

  async getUserReflections(userId: string): Promise<UserReflection[]> {
    return await db
      .select()
      .from(userReflections)
      .where(eq(userReflections.userId, userId));
  }

  async createUserReflection(insertReflection: InsertUserReflection): Promise<UserReflection> {
    const [reflection] = await db
      .insert(userReflections)
      .values(insertReflection)
      .returning();
    return reflection;
  }

  async updateUserReflection(id: string, updates: Partial<UserReflection>): Promise<UserReflection | undefined> {
    const [reflection] = await db
      .update(userReflections)
      .set(updates)
      .where(eq(userReflections.id, id))
      .returning();
    return reflection || undefined;
  }

  async getJournalEntries(userId: string): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values(insertEntry)
      .returning();
    return entry;
  }

  async getWeeklyCompletion(userId: string, week: number): Promise<WeeklyCompletion | undefined> {
    const [completion] = await db
      .select()
      .from(weeklyCompletions)
      .where(and(eq(weeklyCompletions.userId, userId), eq(weeklyCompletions.week, week)));
    return completion || undefined;
  }

  async createWeeklyCompletion(insertCompletion: InsertWeeklyCompletion): Promise<WeeklyCompletion> {
    const [completion] = await db
      .insert(weeklyCompletions)
      .values(insertCompletion)
      .returning();
    return completion;
  }

  // Initialize course data in database
  async initializeCourseData(): Promise<void> {
    // Check if suggestions already exist
    const existingSuggestions = await this.getAllSuggestions();
    if (existingSuggestions.length > 0) {
      return; // Data already initialized
    }

    // Course data from the original MemStorage implementation
    const courseData = [
      // Week 1: Building Awareness
      { week: 1, day: 1, title: "Notice Your Breathing", description: "Take 5 minutes today to gently observe how you breathe when you're around other people. There's no need to change anything - simply notice if your breathing becomes shallow or speeds up. This gentle awareness is the first step in your journey.", category: "awareness" },
      { week: 1, day: 2, title: "Body Scan Check-in", description: "Before you enter any social space today, take a moment to check in with your body. Notice where you might be holding tension - your shoulders, jaw, or stomach - and gently allow those areas to soften and relax.", category: "awareness" },
      { week: 1, day: 3, title: "Thought Observation", description: "Today, gently capture 3 thoughts that come up before you interact with others. There's no need to judge or change these thoughts - simply notice them and see if you can spot any patterns emerging.", category: "awareness" },
      { week: 1, day: 4, title: "Comfort Zone Mapping", description: "Take some time today to map out your social comfort zone. You might draw it or make a list - whatever feels natural. Notice which social situations feel easy and welcoming, and which ones feel more challenging right now.", category: "awareness" },
      { week: 1, day: 5, title: "Anxiety Trigger Journal", description: "Carry a small notebook with you today and gently note any specific moments or situations that trigger feelings of social anxiety. This isn't about fixing anything - just building awareness of your unique patterns.", category: "awareness" },
      { week: 1, day: 6, title: "Self-Compassion Practice", description: "Today, when you catch yourself being self-critical about social moments, pause and ask: 'What would I say to a dear friend in this situation?' Offer yourself that same kindness and understanding.", category: "awareness" },
      { week: 1, day: 7, title: "Celebration Ritual", description: "You've completed your first week of awareness building! Create a meaningful way to celebrate this milestone - perhaps a favorite treat, a special activity, or simply a quiet moment to acknowledge your courage and growth.", category: "awareness" },
      // Week 2: Understanding Your Comfort Zone
      { week: 2, day: 1, title: "Smile at Yourself", description: "Find a quiet moment today to look at yourself in the mirror and offer yourself a genuine, warm smile for 30 seconds. Notice how this simple act of self-kindness feels and how it might shift your mood.", category: "comfort" },
      { week: 2, day: 2, title: "Eye Contact with Cashiers", description: "When you interact with cashiers or service workers today, practice making brief, friendly eye contact. Even just a moment of genuine human connection can feel meaningful for both of you.", category: "comfort" },
      { week: 2, day: 3, title: "Thank You Practice", description: "Today, express heartfelt gratitude to at least 3 people you encounter. Look them in the eyes as you say 'thank you' and let them feel the genuine appreciation behind your words.", category: "comfort" },
      { week: 2, day: 4, title: "Say Excuse Me", description: "When you need to pass by someone or gently get their attention today, practice saying 'excuse me' with a warm, polite tone. Add a moment of friendly eye contact to make the interaction feel more connected.", category: "comfort" },
      { week: 2, day: 5, title: "Weather Comment", description: "Strike up a small conversation today by making a casual, genuine comment about the weather to someone you encounter - perhaps a cashier, neighbor, or coworker. Keep it simple and let it flow naturally.", category: "comfort" },
      { week: 2, day: 6, title: "Compliment Someone", description: "Brighten someone's day by offering a sincere compliment. It might be about something they're wearing, their helpfulness, or any positive quality you genuinely notice. Let your authentic appreciation shine through.", category: "comfort" },
      { week: 2, day: 7, title: "Phone Call Practice", description: "Choose one moment today where you would normally send a text and make a phone call instead. Whether it's ordering food, checking store hours, or reaching out to a family member, embrace the warmth of voice-to-voice connection.", category: "comfort" },
      // Week 3: Small Interactions
      { week: 3, day: 1, title: "Ask for Help", description: "Today, practice the gentle art of asking for help. Reach out to someone for small assistance or directions - even if you already know the answer. Focus on gracefully receiving their kindness and support.", category: "interaction" },
      { week: 3, day: 2, title: "Give a Genuine Compliment", description: "Approach someone and give them a heartfelt compliment about something specific you've noticed - their work, kindness, or style. Practice both giving and receiving positive interactions.", category: "interaction" },
      { week: 3, day: 3, title: "Join a Short Conversation", description: "When you find yourself near an ongoing conversation today, listen for a natural moment to add a thoughtful comment or question. Trust your instincts about when it feels right to gently join in.", category: "interaction" },
      { week: 3, day: 4, title: "Express an Opinion", description: "Find a moment in conversation today to share a gentle opinion about something neutral - perhaps the weather, a local event, or a TV show you've watched. Let your authentic voice be heard in a comfortable way.", category: "interaction" },
      { week: 3, day: 5, title: "Ask Follow-up Questions", description: "When someone shares something with you today, show genuine curiosity by asking a thoughtful follow-up question. This beautiful habit shows you're truly listening and helps conversations flow naturally.", category: "interaction" },
      { week: 3, day: 6, title: "Share Something Personal", description: "Open up a little today by sharing something positive and personal - perhaps a hobby you enjoy, weekend plans, or something that sparks your interest. Let others see a glimpse of who you are beyond small talk.", category: "interaction" },
      { week: 3, day: 7, title: "Initiate a Conversation", description: "Take the gentle step of starting a conversation with someone new today. A warm 'How's your day going?' or similar genuine question can open the door to meaningful connection.", category: "interaction" },
      // Week 4: Group Settings
      { week: 4, day: 1, title: "Attend a Small Group", description: "Today, choose to join a small group activity - whether it's a work meeting, class, or community event. Challenge yourself to stay present for the entire experience, observing how you feel throughout.", category: "group" },
      { week: 4, day: 2, title: "Ask About Someone's Day", description: "Reach out to someone today with genuine curiosity about their experience. Ask 'How has your day been?' or 'How's everything going?' and practice the beautiful art of truly listening to their response.", category: "group" },
      { week: 4, day: 3, title: "Agree with Someone", description: "When you find yourself nodding along with someone's words today, take the step to voice your agreement out loud. A simple 'I think that's a great point' or 'I completely agree' can strengthen connections.", category: "group" },
      { week: 4, day: 4, title: "Share a Personal Recommendation", description: "Recommend something you genuinely enjoy (book, restaurant, movie, app) to someone who might appreciate it. Practice sharing your preferences with others.", category: "interaction" },
      { week: 4, day: 5, title: "Compliment the Group", description: "Acknowledge the positive energy or insights in a group setting today. Share something like 'This has been really helpful' or 'I appreciate how thoughtful everyone is being.' Your recognition can uplift the entire atmosphere.", category: "group" },
      { week: 4, day: 6, title: "Share a Resource", description: "When the moment feels right, offer something valuable to others - perhaps a helpful link, book recommendation, or useful information that relates to your conversation. Sharing your knowledge is a gift to the community.", category: "group" },
      { week: 4, day: 7, title: "Suggest a Group Activity", description: "Take initiative today by proposing a small group activity or inviting others to continue an engaging conversation over coffee or lunch. Your suggestion might be exactly what others were hoping someone would make.", category: "group" },
      // Week 5: Deeper Connections
      { week: 5, day: 1, title: "Share a Challenge", description: "Open up to someone you trust today about a challenge you're currently navigating. Share appropriately and ask for their perspective - you might be surprised by the wisdom and support they offer.", category: "connection" },
      { week: 5, day: 2, title: "Express Vulnerability", description: "Take a courageous step today by sharing something you're learning or working to improve about yourself. This kind of authentic vulnerability often creates the most meaningful connections with others.", category: "connection" },
      { week: 5, day: 3, title: "Ask About Someone's Interests", description: "Discover what lights someone up today by asking about their passions or interests. Listen with your full attention and let your genuine curiosity guide the conversation into deeper territory.", category: "connection" },
      { week: 5, day: 4, title: "Offer Support", description: "When someone shares a difficulty they're facing, extend your heart by offering specific support. A simple 'I'd be happy to help with that' or 'Would you like to talk about it?' can mean the world to someone.", category: "connection" },
      { week: 5, day: 5, title: "Share a Success", description: "Celebrate yourself today by sharing a recent win or accomplishment with someone who cares about you. Practice receiving their positive feedback gracefully and let yourself fully enjoy the moment.", category: "connection" },
      { week: 5, day: 6, title: "Make Plans", description: "Take the initiative to deepen a budding connection by suggesting specific plans together. Whether it's coffee, a walk, or attending an event, your invitation shows that you value the relationship.", category: "connection" },
      { week: 5, day: 7, title: "Express Appreciation", description: "Touch someone's heart today by telling them specifically how they've helped or positively impacted your life. Share the details of what you appreciate - your words might be exactly what they need to hear.", category: "connection" },
      // Week 6: Confidence & Growth
      { week: 6, day: 1, title: "Lead a Conversation", description: "Step into your power today by guiding a conversation toward something you're knowledgeable or passionate about. Trust that your insights and enthusiasm have value and can enrich the discussion.", category: "confidence" },
      { week: 6, day: 2, title: "Handle Disagreement", description: "When you find yourself holding a different viewpoint today, practice expressing it with respect and calm confidence. Remember that healthy disagreement can lead to richer understanding for everyone involved.", category: "confidence" },
      { week: 6, day: 3, title: "Public Speaking Moment", description: "Embrace a moment of visibility today by speaking up in a larger group setting. Whether making an announcement, asking a question in a meeting, or sharing during a presentation, let your voice be heard with confidence.", category: "confidence" },
      { week: 6, day: 4, title: "Network Intentionally", description: "Attend a networking event, social gathering, or community meeting today with the intention of making genuine connections with 2-3 new people. Approach each interaction with curiosity and openness.", category: "confidence" },
      { week: 6, day: 5, title: "Set a Boundary", description: "Honor your needs today by setting a kind but firm boundary when a situation calls for it. Use clear 'I' statements and speak with gentle directness - this is an act of self-respect.", category: "confidence" },
      { week: 6, day: 6, title: "Celebrate Your Growth", description: "Take a moment to share your incredible journey with someone you trust. Reflect on how much you've grown since beginning this program and truly acknowledge the courage and progress you've made.", category: "confidence" },
      { week: 6, day: 7, title: "Plan Your Future", description: "As you near the completion of this transformative journey, create a thoughtful plan for continuing your social growth. Set 2-3 specific, meaningful goals for the next month that will keep you moving forward with confidence.", category: "confidence" },
    ];

    // Insert all course suggestions
    for (const data of courseData) {
      await this.createSuggestion(data);
    }
  }
}

// For development, keep MemStorage available but switch to DatabaseStorage
export const storage = new DatabaseStorage();

// Helper function to create a test user with all suggestions completed
export async function createTestUser(): Promise<string> {
  // Ensure course data is initialized
  await (storage as DatabaseStorage).initializeCourseData();
  
  const testUser = await storage.createUser({
    name: "Test User",
    currentWeek: 6,
    currentSuggestion: 7,
    completedSuggestions: 42
  });
  
  // Create reflections for all 42 suggestions
  const suggestions = await storage.getAllSuggestions();
  for (let i = 0; i < 42; i++) {
    await storage.createUserReflection({
      userId: testUser.id,
      suggestionId: suggestions[i].id,
      reflection: "Completed this challenge successfully!",
      completed: true
    });
  }
  
  // Create weekly completions for all 6 weeks
  for (let week = 1; week <= 6; week++) {
    await storage.createWeeklyCompletion({
      userId: testUser.id,
      week: week,
      reflection: `Completed week ${week} successfully!`
    });
  }
  
  return testUser.id;
}

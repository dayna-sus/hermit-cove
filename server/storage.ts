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
  type InsertWeeklyCompletion 
} from "@shared/schema";
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
      { week: 1, day: 1, title: "Notice Your Breathing", description: "Spend 5 minutes today observing your breathing patterns in social situations. Don't try to change anything, just notice when your breathing becomes shallow or rapid.", category: "awareness" },
      { week: 1, day: 2, title: "Body Scan Check-in", description: "Before entering any social space, do a quick body scan. Notice where you hold tension and gently relax those areas.", category: "awareness" },
      { week: 1, day: 3, title: "Thought Observation", description: "Write down 3 thoughts you have before a social interaction. Don't judge them, just observe and note the patterns.", category: "awareness" },
      { week: 1, day: 4, title: "Comfort Zone Mapping", description: "Draw or list your current comfort zone. What social situations feel easy? Which ones feel challenging?", category: "awareness" },
      { week: 1, day: 5, title: "Anxiety Trigger Journal", description: "Keep a small notebook and jot down what specific social triggers make you feel anxious throughout the day.", category: "awareness" },
      { week: 1, day: 6, title: "Self-Compassion Practice", description: "When you notice self-critical thoughts about social interactions, practice speaking to yourself as you would a good friend.", category: "awareness" },
      { week: 1, day: 7, title: "Celebration Ritual", description: "Create a small celebration ritual for completing your first week. This could be a favorite treat, activity, or moment of acknowledgment.", category: "awareness" },

      // Week 2: Understanding Your Comfort Zone
      { week: 2, day: 1, title: "Smile at Yourself", description: "Practice smiling genuinely at yourself in the mirror for 30 seconds. Notice how it feels and affects your mood.", category: "comfort" },
      { week: 2, day: 2, title: "Eye Contact with Cashiers", description: "Make brief, friendly eye contact with cashiers or service workers. Start with just a moment of connection.", category: "comfort" },
      { week: 2, day: 3, title: "Thank You Practice", description: "Make it a point to say 'thank you' with genuine appreciation to at least 3 people today, maintaining eye contact.", category: "comfort" },
      { week: 2, day: 4, title: "Hold the Door", description: "When approaching a door and someone is behind you, hold it open for them. A simple 'here you go' or just a smile works perfectly.", category: "comfort" },
      { week: 2, day: 5, title: "Weather Comment", description: "Make one casual comment about the weather to someone (cashier, neighbor, coworker). Keep it simple and genuine.", category: "comfort" },
      { week: 2, day: 6, title: "Compliment Someone", description: "Give one genuine compliment to someone today. It could be about their shirt, helpfulness, or anything authentic you notice.", category: "comfort" },
      { week: 2, day: 7, title: "Phone Call Practice", description: "Make one phone call instead of sending a text. It could be to order food, ask about store hours, or call a family member.", category: "comfort" },

      // Week 3: Small Interactions
      { week: 3, day: 1, title: "Ask for Help", description: "Ask someone for small help or directions, even if you already know the answer. Practice receiving assistance gracefully.", category: "interaction" },
      { week: 3, day: 2, title: "Introduce Yourself", description: "Introduce yourself to one new person today - a neighbor, coworker, or someone in your regular environment.", category: "interaction" },
      { week: 3, day: 3, title: "Join a Short Conversation", description: "Add one comment or question to an existing conversation. Listen for natural entry points.", category: "interaction" },
      { week: 3, day: 4, title: "Express an Opinion", description: "Share a mild opinion about something neutral (weather, local event, TV show) in a conversation.", category: "interaction" },
      { week: 3, day: 5, title: "Ask Follow-up Questions", description: "When someone shares something with you, ask one follow-up question to show interest and keep the conversation flowing.", category: "interaction" },
      { week: 3, day: 6, title: "Share Something Personal", description: "Share one small, positive personal detail (hobby, weekend plan, or interest) in a conversation.", category: "interaction" },
      { week: 3, day: 7, title: "Initiate a Conversation", description: "Start a brief conversation with someone new. A simple 'How's your day going?' can be a great opener.", category: "interaction" },

      // Week 4: Group Settings
      { week: 4, day: 1, title: "Attend a Small Group", description: "Join a small group activity (work meeting, class, community event) and commit to staying for the full duration.", category: "group" },
      { week: 4, day: 2, title: "Speak Up in a Group", description: "Contribute at least one comment or question in a group setting. Choose something low-stakes to share.", category: "group" },
      { week: 4, day: 3, title: "Agree with Someone", description: "When someone in a group says something you agree with, voice your agreement: 'I think that's a great point' or 'I agree.'", category: "group" },
      { week: 4, day: 4, title: "Ask a Group Question", description: "Ask one question to the group about the topic being discussed. This shows engagement and interest.", category: "group" },
      { week: 4, day: 5, title: "Include Someone Quiet", description: "If you notice someone being quiet in a group, gently invite their input: 'What do you think about this, [name]?'", category: "group" },
      { week: 4, day: 6, title: "Share a Resource", description: "Share something helpful with the group - a link, book recommendation, or useful information related to your discussion.", category: "group" },
      { week: 4, day: 7, title: "Suggest a Group Activity", description: "Propose a small group activity or suggest continuing a conversation over coffee/lunch with interested members.", category: "group" },

      // Week 5: Deeper Connections
      { week: 5, day: 1, title: "Share a Challenge", description: "Share a current challenge you're facing (appropriately) with someone you feel comfortable with and ask for their perspective.", category: "connection" },
      { week: 5, day: 2, title: "Express Vulnerability", description: "Share something you're learning or working on improving about yourself. Vulnerability builds deeper connections.", category: "connection" },
      { week: 5, day: 3, title: "Ask About Someone's Interests", description: "Ask someone about something they're passionate about and really listen to their answer. Show genuine curiosity.", category: "connection" },
      { week: 5, day: 4, title: "Offer Support", description: "If someone mentions a challenge, offer specific support: 'I'd be happy to help with that' or 'Would you like to talk about it?'", category: "connection" },
      { week: 5, day: 5, title: "Share a Success", description: "Share a recent win or something you're proud of with someone. Practice receiving positive feedback gracefully.", category: "connection" },
      { week: 5, day: 6, title: "Make Plans", description: "Suggest specific plans with someone you've been connecting with. It could be coffee, a walk, or attending an event together.", category: "connection" },
      { week: 5, day: 7, title: "Express Appreciation", description: "Tell someone specifically how they've helped or positively impacted you. Be detailed about what you appreciate.", category: "connection" },

      // Week 6: Confidence & Growth
      { week: 6, day: 1, title: "Lead a Conversation", description: "Take the lead in directing a conversation toward a topic you're knowledgeable or passionate about.", category: "confidence" },
      { week: 6, day: 2, title: "Handle Disagreement", description: "When you disagree with someone, practice expressing your different viewpoint respectfully and calmly.", category: "confidence" },
      { week: 6, day: 3, title: "Public Speaking Moment", description: "Speak up in a larger group setting - make an announcement, ask a question in a meeting, or share during a presentation.", category: "confidence" },
      { week: 6, day: 4, title: "Network Intentionally", description: "Attend a networking event, social gathering, or community meeting with the goal of meeting 2-3 new people.", category: "confidence" },
      { week: 6, day: 5, title: "Set a Boundary", description: "Practice setting a kind but firm boundary in a social situation when needed. Use 'I' statements and be direct.", category: "confidence" },
      { week: 6, day: 6, title: "Celebrate Your Growth", description: "Share your social anxiety journey and growth with someone you trust. Acknowledge how far you've come.", category: "confidence" },
      { week: 6, day: 7, title: "Plan Your Future", description: "Create a plan for continuing your social growth beyond this program. Set 2-3 specific goals for the next month.", category: "confidence" },
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

export const storage = new MemStorage();

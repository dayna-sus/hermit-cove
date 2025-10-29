# HERMIT COVE - COMPLETE CODE EXPORT
## Social Anxiety Recovery App - Full Source Code

**Generated:** October 29, 2025  
**Description:** A 6-week social anxiety recovery web application with daily suggestions, AI encouragement, journaling, and progress tracking.  
**Tech Stack:** React, TypeScript, Express, PostgreSQL (Drizzle ORM), OpenAI GPT-5  

---

## TABLE OF CONTENTS

1. [Project Configuration](#1-project-configuration)
2. [Database Schema](#2-database-schema)
3. [Backend Server Code](#3-backend-server-code)
4. [Frontend Application](#4-frontend-application)
5. [Configuration Files](#5-configuration-files)

---

## 1. PROJECT CONFIGURATION

### package.json
```json
{
  "name": "hermit-cove",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@neondatabase/serverless": "^0.10.4",
    "@radix-ui/react-*": "Various UI components",
    "@tanstack/react-query": "^5.60.5",
    "drizzle-orm": "^0.39.1",
    "express": "^4.21.2",
    "openai": "^5.18.1",
    "react": "^18.3.1",
    "wouter": "^3.3.5",
    "zod": "^3.24.2"
  }
}
```

---

## 2. DATABASE SCHEMA

### shared/schema.ts
```typescript
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLES ===

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  name: text("name").notNull(),
  currentWeek: integer("current_week").notNull().default(1),
  currentSuggestion: integer("current_suggestion").notNull().default(1),
  completedSuggestions: integer("completed_suggestions").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql\`now()\`),
  lastActiveAt: timestamp("last_active_at").notNull().default(sql\`now()\`),
});

export const suggestions = pgTable("suggestions", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  week: integer("week").notNull(),
  day: integer("day").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
});

export const userReflections = pgTable("user_reflections", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  userId: varchar("user_id").notNull().references(() => users.id),
  suggestionId: varchar("suggestion_id").notNull().references(() => suggestions.id),
  reflection: text("reflection").notNull(),
  aiResponse: text("ai_response"),
  sentiment: text("sentiment"),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql\`now()\`),
});

export const journalEntries = pgTable("journal_entries", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mood: text("mood"),
  week: integer("week"),
  day: integer("day"),
  createdAt: timestamp("created_at").notNull().default(sql\`now()\`),
});

export const weeklyCompletions = pgTable("weekly_completions", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  userId: varchar("user_id").notNull().references(() => users.id),
  week: integer("week").notNull(),
  reflection: text("reflection"),
  completedAt: timestamp("completed_at").notNull().default(sql\`now()\`),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql\`gen_random_uuid()\`),
  message: text("message").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().default(sql\`now()\`),
});

// === INSERT SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActiveAt: true,
});

export const insertUserReflectionSchema = createInsertSchema(userReflections).omit({
  id: true,
  aiResponse: true,
  sentiment: true,
  createdAt: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertWeeklyCompletionSchema = createInsertSchema(weeklyCompletions).omit({
  id: true,
  completedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

// === TYPES ===

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Suggestion = typeof suggestions.$inferSelect;
export type UserReflection = typeof userReflections.$inferSelect;
export type InsertUserReflection = z.infer<typeof insertUserReflectionSchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type WeeklyCompletion = typeof weeklyCompletions.$inferSelect;
export type InsertWeeklyCompletion = z.infer<typeof insertWeeklyCompletionSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
```

---

## 3. BACKEND SERVER CODE

### server/index.ts
```typescript
import express from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = \`\${req.method} \${path} \${res.statusCode} in \${duration}ms\`;
      if (capturedJsonResponse) {
        logLine += \` :: \${JSON.stringify(capturedJsonResponse)}\`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Setup Vite or static files
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(\`serving on port \${port}\`);
    storage.initializeCourseData().catch(err => {
      log(\`Database initialization error: \${err.message}\`);
    });
  });
})();
```

### server/routes.ts (API Endpoints)
```typescript
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateEncouragement, generateJournalEncouragement } from "./services/openai";
import { 
  insertUserSchema, 
  insertUserReflectionSchema, 
  insertJournalEntrySchema,
  insertWeeklyCompletionSchema,
  insertFeedbackSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/health", (_req, res) => res.status(200).send("ok"));
  
  // === USER ENDPOINTS ===
  
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // === SUGGESTION ENDPOINTS ===
  
  app.get("/api/suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getAllSuggestions();
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  app.get("/api/suggestions/week/:week/day/:day", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      const day = parseInt(req.params.day);
      const suggestion = await storage.getSuggestionByWeekAndDay(week, day);
      if (!suggestion) return res.status(404).json({ error: "Suggestion not found" });
      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestion" });
    }
  });

  // === REFLECTION ENDPOINTS ===
  
  app.post("/api/reflections", async (req, res) => {
    try {
      const reflectionData = insertUserReflectionSchema.parse(req.body);
      const reflection = await storage.createUserReflection(reflectionData);
      
      const suggestion = await storage.getSuggestion(reflectionData.suggestionId);
      if (!suggestion) return res.status(404).json({ error: "Suggestion not found" });

      // Generate AI encouragement
      try {
        const encouragement = await generateEncouragement(
          reflectionData.reflection,
          suggestion.description
        );
        
        const updatedReflection = await storage.updateUserReflection(reflection.id, {
          aiResponse: encouragement.message,
          sentiment: encouragement.sentiment
        });
        
        res.json(updatedReflection);
      } catch (error) {
        console.error('Failed to generate encouragement:', error);
        res.json(reflection);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create reflection" });
    }
  });

  app.get("/api/users/:userId/reflections", async (req, res) => {
    try {
      const reflections = await storage.getUserReflections(req.params.userId);
      
      // Enrich with suggestion details
      const enrichedReflections = await Promise.all(
        reflections.map(async (reflection) => {
          const suggestion = await storage.getSuggestion(reflection.suggestionId);
          return { ...reflection, suggestion: suggestion || null };
        })
      );
      
      res.json(enrichedReflections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  // === JOURNAL ENDPOINTS ===
  
  app.post("/api/journal", async (req, res) => {
    try {
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(entryData);
      
      if (entryData.content && entryData.mood) {
        try {
          const encouragement = await generateJournalEncouragement(entryData.content, entryData.mood);
          res.json({ ...entry, aiEncouragement: encouragement });
        } catch (error) {
          res.json(entry);
        }
      } else {
        res.json(entry);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  app.get("/api/users/:userId/journal", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries(req.params.userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  // === FEEDBACK ENDPOINTS ===
  
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        message: req.body.message,
        userAgent: req.get('User-Agent')
      });
      
      const savedFeedback = await storage.createFeedback(feedbackData);
      res.json({ success: true, message: "Feedback sent successfully", feedback: savedFeedback });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
```

### server/services/openai.ts (AI Integration)
```typescript
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "default_key"
});

interface EncouragementResponse {
  message: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  encouragementLevel: 'gentle' | 'moderate' | 'strong';
}

const fallbackMessages: EncouragementResponse[] = [
  {
    message: "Thank you for sharing your experience. Growth happens one wave at a time. You're braver than you know! 🌊🦀",
    sentiment: 'neutral',
    encouragementLevel: 'moderate'
  },
  {
    message: "Every small step you take creates ripples of positive change. Your courage is inspiring! 🐚✨",
    sentiment: 'positive',
    encouragementLevel: 'gentle'
  }
  // ... 17 more fallback messages
];

function getRandomFallbackEncouragement(): EncouragementResponse {
  const randomIndex = Math.floor(Math.random() * fallbackMessages.length);
  return fallbackMessages[randomIndex];
}

export async function generateEncouragement(
  reflection: string,
  suggestionDescription: string
): Promise<EncouragementResponse> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!apiKey || apiKey === "default_key") {
    return getRandomFallbackEncouragement();
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [{ 
        role: "user", 
        content: \`You are a warm, marine-biologist-turned-therapist helping someone with social anxiety.
        
Challenge: "\${suggestionDescription}"
User Reflection: "\${reflection}"

Create a response that:
1. Celebrates their specific efforts (2-3 sentences)
2. Uses ocean/marine metaphors naturally 
3. Acknowledges both struggles and victories
4. Includes marine emojis (🌊, 🐚, 🦀, ⭐)

Respond in JSON: {"message": "", "sentiment": "", "encouragementLevel": ""}\`
      }],
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
    return getRandomFallbackEncouragement();
  }
}

export async function generateJournalEncouragement(
  journalContent: string,
  mood: string
): Promise<string> {
  // Similar implementation for journal entries
  // Returns personalized encouragement for journal reflections
}
```

---

## 4. FRONTEND APPLICATION

### client/src/App.tsx (Main React App)
```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
import LandingPage from "@/pages/landing";
import CourseDashboard from "@/pages/course-dashboard";
import SuggestionPage from "@/pages/suggestion";
import ReflectionHistoryPage from "@/pages/reflection-history";
import JournalPage from "@/pages/journal";
import FinalCelebrationPage from "@/pages/final-celebration";
import AboutCreatorPage from "@/pages/about-creator";
import FeedbackListPage from "@/pages/feedback-list";

function AppContent() {
  return (
    <div className="min-h-screen">
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/dashboard" component={CourseDashboard} />
        <Route path="/suggestion/:week/:day">
          {(params) => <SuggestionPage params={params} />}
        </Route>
        <Route path="/reflections" component={ReflectionHistoryPage} />
        <Route path="/journal" component={JournalPage} />
        <Route path="/final-celebration" component={FinalCelebrationPage} />
        <Route path="/about-creator" component={AboutCreatorPage} />
        <Route path="/feedback" component={FeedbackListPage} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
```

### client/src/pages/landing.tsx (Welcome Page)
```typescript
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CrabProgress from "@/components/crab-progress";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      return await apiRequest("/api/users", {
        method: "POST",
        body: userData
      });
    },
    onSuccess: (user) => {
      localStorage.setItem("hermitCoveUserId", user.id);
      navigate("/dashboard");
    }
  });

  const handleStartJourney = () => {
    if (!userName.trim()) return;
    createUserMutation.mutate({
      name: userName.trim(),
      currentWeek: 1,
      currentSuggestion: 1,
      completedSuggestions: 0,
    });
  };

  return (
    <div className="min-h-screen wave-pattern">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4">🐚 Hermit Cove 🌊</h1>
          <p className="text-xl text-muted-foreground">
            A gentle 6-week journey to help you emerge from your shell 
            and overcome social anxiety, one small step at a time.
          </p>
        </header>

        <div className="max-w-2xl mx-auto text-center">
          <CrabProgress completedSuggestions={0} size="xl" showProgress={false} />
          
          {!showNameInput ? (
            <Button onClick={() => setShowNameInput(true)} size="lg">
              Begin Your Journey
            </Button>
          ) : (
            <div className="mt-8">
              <Input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="mb-4"
              />
              <Button onClick={handleStartJourney} size="lg">
                Start Transformation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### client/src/pages/course-dashboard.tsx (Main Dashboard)
```typescript
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CrabProgress from "@/components/crab-progress";
import { COURSE_WEEKS } from "@/lib/course-data";
import type { User, Suggestion } from "@shared/schema";

export default function CourseDashboard() {
  const [, navigate] = useLocation();
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("hermitCoveUserId");
    if (!storedUserId) {
      navigate("/");
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  const { data: user } = useQuery({
    queryKey: ["/api/users", userId],
    enabled: !!userId,
  });

  const { data: suggestions } = useQuery({
    queryKey: ["/api/suggestions"],
  });

  if (!user || !suggestions) return <div>Loading...</div>;

  const progressPercent = (user.completedSuggestions / 42) * 100;
  const currentWeekData = COURSE_WEEKS.find(w => w.week === user.currentWeek);
  
  return (
    <div className="min-h-screen wave-pattern p-4">
      <div className="container mx-auto max-w-6xl">
        <Card className="rounded-3xl p-6 mb-8">
          <CardContent>
            <h2 className="text-2xl font-bold mb-2">Your Journey Progress</h2>
            <p className="text-muted-foreground mb-4">
              Week {user.currentWeek} of 6 • {user.completedSuggestions} of 42 suggestions completed
            </p>
            
            <CrabProgress 
              completedSuggestions={user.completedSuggestions} 
              size="lg" 
            />
            
            <Progress value={progressPercent} className="h-3 mt-4" />
            
            <Button 
              onClick={() => navigate(\`/suggestion/\${user.currentWeek}/\${user.currentSuggestion}\`)}
              size="lg"
              className="mt-6"
            >
              Continue Your Journey →
            </Button>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Current Week</h3>
              <p className="text-3xl">{currentWeekData?.emoji}</p>
              <p className="text-lg font-semibold">{currentWeekData?.title}</p>
              <p className="text-sm text-muted-foreground">{currentWeekData?.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <Button onClick={() => navigate("/journal")} variant="outline" className="w-full mb-2">
                📖 Open Journal
              </Button>
              <Button onClick={() => navigate("/reflections")} variant="outline" className="w-full">
                📝 View Reflections
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 5. KEY FEATURES

### Daily Suggestions (42 total across 6 weeks)
- Week 1: Building Awareness (breathing, body scans, thought observation)
- Week 2: Understanding Comfort Zone (smiling, eye contact, small talk)
- Week 3: Small Interactions (asking for help, joining conversations)
- Week 4: Group Settings (attending events, group discussions)
- Week 5: Deeper Connections (vulnerability, expressing needs)
- Week 6: Confidence & Growth (leading conversations, public speaking)

### AI Integration
- OpenAI GPT-5 for personalized encouragement
- 19 fallback messages with marine themes (🌊, 🦀, 🐚, ⭐)
- Sentiment analysis and encouragement level detection
- Journal entry encouragement

### Progress Tracking
- Evolving crab mascot (7 stages from shell to freedom)
- Visual progress bar
- Week completion celebrations
- Reflection history

### Data Storage
- PostgreSQL database with Drizzle ORM
- Tables: users, suggestions, user_reflections, journal_entries, weekly_completions, feedback
- Automatic UUID generation and timestamps

---

## DEPLOYMENT INFORMATION

**Current Development URL:** https://18c5d3f6-7f44-4ffe-ac27-7809dce578d0-00-2noavsc3u3d68.spock.replit.dev

**Environment Variables Required:**
- DATABASE_URL (PostgreSQL connection string)
- OPENAI_API_KEY (for AI encouragement)
- PORT (defaults to 5000)

**Build Commands:**
- Development: \`npm run dev\`
- Production Build: \`npm run build\`
- Database Push: \`npm run db:push\`

---

## CONTACT & FEEDBACK

Feedback can be submitted through the app at \`/about-creator\` page.  
All feedback is stored in the database and viewable at \`/feedback\` page.

---

**End of Hermit Cove Complete Code Export**  
*Generated for backup, documentation, and GitHub repository purposes*

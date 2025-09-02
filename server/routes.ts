import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateEncouragement, generateJournalEncouragement } from "./services/openai";
import { 
  insertUserSchema, 
  insertUserReflectionSchema, 
  insertJournalEntrySchema,
  insertWeeklyCompletionSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create or get user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Get user
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Update user progress
  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Get all suggestions
  app.get("/api/suggestions", async (req, res) => {
    try {
      const suggestions = await storage.getAllSuggestions();
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestions" });
    }
  });

  // Get suggestion by week and day
  app.get("/api/suggestions/week/:week/day/:day", async (req, res) => {
    try {
      const week = parseInt(req.params.week);
      const day = parseInt(req.params.day);
      const suggestion = await storage.getSuggestionByWeekAndDay(week, day);
      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch suggestion" });
    }
  });

  // Submit reflection with AI response
  app.post("/api/reflections", async (req, res) => {
    try {
      const reflectionData = insertUserReflectionSchema.parse(req.body);
      const reflection = await storage.createUserReflection(reflectionData);
      
      // Get the suggestion for context
      const suggestion = await storage.getSuggestion(reflectionData.suggestionId);
      if (!suggestion) {
        return res.status(404).json({ error: "Suggestion not found" });
      }

      // Generate AI encouragement
      try {
        const encouragement = await generateEncouragement(
          reflectionData.reflection,
          suggestion.description
        );
        
        // Update the reflection with AI response
        const updatedReflection = await storage.updateUserReflection(reflection.id, {
          aiResponse: encouragement.message,
          sentiment: encouragement.sentiment
        });
        
        res.json(updatedReflection);
      } catch (error) {
        console.error('Failed to generate encouragement:', error);
        // Still return the reflection even if AI fails
        res.json(reflection);
      }
    } catch (error) {
      console.error('Error creating reflection:', error);
      res.status(500).json({ error: "Failed to create reflection" });
    }
  });

  // Get user reflections
  app.get("/api/users/:userId/reflections", async (req, res) => {
    try {
      const reflections = await storage.getUserReflections(req.params.userId);
      res.json(reflections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflections" });
    }
  });

  // Get specific reflection
  app.get("/api/reflections/:userId/:suggestionId", async (req, res) => {
    try {
      const reflection = await storage.getUserReflection(req.params.userId, req.params.suggestionId);
      if (!reflection) {
        return res.status(404).json({ error: "Reflection not found" });
      }
      res.json(reflection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reflection" });
    }
  });

  // Complete suggestion and update user progress
  app.post("/api/users/:userId/complete-suggestion", async (req, res) => {
    try {
      const { suggestionId } = req.body;
      const userId = req.params.userId;
      
      // Mark reflection as completed
      const reflection = await storage.getUserReflection(userId, suggestionId);
      if (reflection) {
        await storage.updateUserReflection(reflection.id, { completed: true });
      }
      
      // Update user progress
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const completedSuggestions = user.completedSuggestions + 1;
      const currentWeek = Math.floor((completedSuggestions - 1) / 7) + 1;
      const currentSuggestion = ((completedSuggestions - 1) % 7) + 1;

      const updatedUser = await storage.updateUser(userId, {
        completedSuggestions,
        currentWeek: Math.min(currentWeek, 6),
        currentSuggestion: currentSuggestion === 7 ? 7 : currentSuggestion + 1
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete suggestion" });
    }
  });

  // Create journal entry
  app.post("/api/journal", async (req, res) => {
    try {
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(entryData);
      
      // Generate AI encouragement for journal entry
      if (entryData.content && entryData.mood) {
        try {
          const encouragement = await generateJournalEncouragement(entryData.content, entryData.mood);
          res.json({ ...entry, aiEncouragement: encouragement });
        } catch (error) {
          console.error('Failed to generate journal encouragement:', error);
          res.json(entry);
        }
      } else {
        res.json(entry);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to create journal entry" });
    }
  });

  // Get user journal entries
  app.get("/api/users/:userId/journal", async (req, res) => {
    try {
      const entries = await storage.getJournalEntries(req.params.userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch journal entries" });
    }
  });

  // Complete week
  app.post("/api/users/:userId/complete-week", async (req, res) => {
    try {
      const completionData = insertWeeklyCompletionSchema.parse({
        userId: req.params.userId,
        ...req.body
      });
      const completion = await storage.createWeeklyCompletion(completionData);
      res.json(completion);
    } catch (error) {
      res.status(500).json({ error: "Failed to complete week" });
    }
  });

  // Get weekly completion
  app.get("/api/users/:userId/weeks/:week/completion", async (req, res) => {
    try {
      const completion = await storage.getWeeklyCompletion(
        req.params.userId, 
        parseInt(req.params.week)
      );
      if (!completion) {
        return res.status(404).json({ error: "Weekly completion not found" });
      }
      res.json(completion);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weekly completion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

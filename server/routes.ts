import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, createTestUser } from "./storage";
import { generateEncouragement, generateJournalEncouragement } from "./services/openai";
import { sendFeedbackEmail } from "./services/email";
import { 
  insertUserSchema, 
  insertUserReflectionSchema, 
  insertJournalEntrySchema,
  insertWeeklyCompletionSchema 
} from "@shared/schema";

// Admin authentication middleware
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const rawAdminToken = process.env.ADMIN_TOKEN;
  
  if (!rawAdminToken) {
    console.error('ADMIN_TOKEN environment variable is not set');
    return res.status(500).json({ 
      error: 'Configuration error', 
      message: 'Server configuration issue' 
    });
  }
  
  // Normalize admin token
  const adminToken = rawAdminToken.trim().replace(/^"|"$/g, '');
  const cookieToken = req.cookies.adminAuth;
  
  if (!cookieToken || cookieToken !== adminToken) {
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Admin authentication required' 
    });
  }
  
  next();
}

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

  // Create test user with all suggestions completed (for testing celebration page)
  app.post("/api/users/test-complete", async (req, res) => {
    try {
      const userId = await createTestUser();
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create test user" });
    }
  });

  // Submit feedback from users
  app.post("/api/feedback", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Send feedback email to the creator (email address is hidden in the service)
      await sendFeedbackEmail({
        message: message.trim(),
        timestamp: new Date(),
        userAgent: req.get('User-Agent')
      });
      
      res.json({ success: true, message: "Feedback sent successfully" });
    } catch (error) {
      console.error('Error sending feedback:', error);
      res.status(500).json({ error: "Failed to submit feedback" });
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
      
      // Calculate what the next suggestion should be
      let nextWeek = user.currentWeek;
      let nextDay = user.currentSuggestion;
      
      // If we just completed the last day of the week (day 7), advance to next week
      if (user.currentSuggestion >= 7) {
        nextWeek = Math.min(user.currentWeek + 1, 6);
        nextDay = 1;
      } else {
        // Otherwise, just advance to the next day in the current week
        nextDay = user.currentSuggestion + 1;
      }

      const updatedUser = await storage.updateUser(userId, {
        completedSuggestions,
        currentWeek: nextWeek,
        currentSuggestion: nextDay
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

  // Fix user progress (temporary endpoint for debugging)
  app.post("/api/users/:userId/fix-progress", async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // If user completed 7 suggestions but still on week 1, advance them
      if (user.completedSuggestions >= 7 && user.currentWeek === 1) {
        const updatedUser = await storage.updateUser(userId, {
          currentWeek: 2,
          currentSuggestion: 1
        });
        res.json(updatedUser);
      } else {
        res.json(user);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fix progress" });
    }
  });

  // Admin authentication endpoint
  app.post("/api/admin/auth", (req, res) => {
    const { token } = req.body;
    const rawAdminToken = process.env.ADMIN_TOKEN;
    
    if (!rawAdminToken) {
      console.error('ADMIN_TOKEN environment variable is not set');
      return res.status(500).json({ 
        error: 'Configuration error', 
        message: 'Server configuration issue' 
      });
    }
    
    // Normalize tokens by trimming whitespace and removing quotes
    const adminToken = rawAdminToken.trim().replace(/^"|"$/g, '');
    const inputToken = (token || '').trim();
    
    // Temporary debug logging (remove after fixing)
    console.log('Token lengths:', { envLen: adminToken.length, inputLen: inputToken.length });
    
    if (!inputToken || inputToken !== adminToken) {
      return res.status(401).json({ 
        error: 'Invalid token', 
        message: 'Please check your admin credentials' 
      });
    }
    
    // Set secure httpOnly cookie
    res.cookie('adminAuth', adminToken, {
      httpOnly: true,
      secure: false, // Allow for development
      sameSite: 'lax', // More lenient for development
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/' // Ensure cookie is available for all paths
    });
    
    res.json({ 
      success: true, 
      message: 'Authentication successful'
    });
  });
  
  // Admin logout endpoint
  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie('adminAuth', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    });
    
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  });

  // Admin endpoints for dashboard analytics (protected)
  app.get("/api/admin/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: "Failed to fetch admin statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express } from 'express';
import { createServer, type Server } from 'http';
import { storage } from './storage';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const user = await storage.insertUser({ username, password });
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      req.session.userId = user.id;
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ success: true });
    });
  });

  // Character Routes
  app.post('/api/characters/save', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const characterData = req.body;
      const character = await storage.db.insert(schema.characters).values({
        userId: req.session.userId,
        characterData: characterData,
      }).returning();

      res.json({ success: true, character });
    } catch (error) {
      console.error('Save character error:', error);
      res.status(500).json({ error: 'Failed to save character' });
    }
  });

  app.get('/api/characters', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const characters = await storage.db
        .select()
        .from(schema.characters)
        .where(eq(schema.characters.userId, req.session.userId));

      res.json(characters);
    } catch (error) {
      console.error('Get characters error:', error);
      res.status(500).json({ error: 'Failed to get characters' });
    }
  });

  app.get('/api/characters/:id', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const characterId = parseInt(req.params.id);
      const character = await storage.db
        .select()
        .from(schema.characters)
        .where(eq(schema.characters.id, characterId))
        .limit(1);

      if (!character.length || character[0].userId !== req.session.userId) {
        return res.status(404).json({ error: 'Character not found' });
      }

      res.json(character[0]);
    } catch (error) {
      console.error('Get character error:', error);
      res.status(500).json({ error: 'Failed to get character' });
    }
  });

  // Game Save Routes
  app.post('/api/saves', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { gameState, slot } = req.body;

      const save = await storage.db.insert(schema.gameSaves).values({
        userId: req.session.userId,
        slot: slot || 1,
        gameState: gameState,
      }).returning();

      res.json({ success: true, save });
    } catch (error) {
      console.error('Save game error:', error);
      res.status(500).json({ error: 'Failed to save game' });
    }
  });

  app.get('/api/saves/:slot', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const slot = parseInt(req.params.slot);
      const save = await storage.db
        .select()
        .from(schema.gameSaves)
        .where(eq(schema.gameSaves.userId, req.session.userId))
        .where(eq(schema.gameSaves.slot, slot))
        .limit(1);

      if (!save.length) {
        return res.status(404).json({ error: 'Save not found' });
      }

      res.json(save[0].gameState);
    } catch (error) {
      console.error('Load game error:', error);
      res.status(500).json({ error: 'Failed to load game' });
    }
  });

  app.get('/api/saves', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const saves = await storage.db
        .select()
        .from(schema.gameSaves)
        .where(eq(schema.gameSaves.userId, req.session.userId));

      res.json(saves);
    } catch (error) {
      console.error('Get saves error:', error);
      res.status(500).json({ error: 'Failed to get saves' });
    }
  });

  // Leaderboard Routes
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const type = req.query.type || 'level';
      const limit = parseInt(req.query.limit as string) || 10;

      let orderBy;
      if (type === 'level') {
        orderBy = desc(schema.leaderboardEntries.level);
      } else if (type === 'playtime') {
        orderBy = desc(schema.leaderboardEntries.playtime);
      } else {
        orderBy = desc(schema.leaderboardEntries.achievementsUnlocked);
      }

      const entries = await storage.db
        .select()
        .from(schema.leaderboardEntries)
        .orderBy(orderBy)
        .limit(limit);

      res.json(entries);
    } catch (error) {
      console.error('Leaderboard error:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  });

  app.post('/api/leaderboard', async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const character = req.body;

      const entry = await storage.db.insert(schema.leaderboardEntries).values({
        userId: req.session.userId,
        characterName: character.name,
        characterClass: character.class,
        level: character.level,
        playtime: character.playtime || 0,
        achievementsUnlocked: 0, // Would come from achievements store
      }).returning();

      res.json({ success: true, entry });
    } catch (error) {
      console.error('Submit leaderboard error:', error);
      res.status(500).json({ error: 'Failed to submit to leaderboard' });
    }
  });

  // Analytics Route
  app.post('/api/analytics/event', async (req, res) => {
    try {
      const { event, data } = req.body;

      await storage.db.insert(schema.analyticsEvents).values({
        userId: req.session.userId || null,
        event,
        data,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Failed to track event' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

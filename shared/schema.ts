import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  characterData: jsonb('character_data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gameSaves = pgTable('game_saves', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  slot: integer('slot').notNull().default(1),
  gameState: jsonb('game_state').notNull(),
  lastSaved: timestamp('last_saved').defaultNow().notNull(),
});

export const leaderboardEntries = pgTable('leaderboard_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  characterName: text('character_name').notNull(),
  characterClass: text('character_class').notNull(),
  level: integer('level').notNull(),
  playtime: integer('playtime').notNull(),
  achievementsUnlocked: integer('achievements_unlocked').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const analyticsEvents = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  event: text('event').notNull(),
  data: jsonb('data'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCharacterSchema = createInsertSchema(characters).pick({
  userId: true,
  characterData: true,
});

export const insertGameSaveSchema = createInsertSchema(gameSaves).pick({
  userId: true,
  slot: true,
  gameState: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboardEntries).pick({
  userId: true,
  characterName: true,
  characterClass: true,
  level: true,
  playtime: true,
  achievementsUnlocked: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Character = typeof characters.$inferSelect;
export type GameSave = typeof gameSaves.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;

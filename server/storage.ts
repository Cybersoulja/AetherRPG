import { eq } from 'drizzle-orm';
import { getDb } from './db';
import { users, type User, type InsertUser } from '../shared/schema';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  insertUser(user: InsertUser): Promise<User>;
}

export class DatabaseStorage implements IStorage {
  get db() {
    return getDb();
  }

  async getUser(id: number): Promise<User | undefined> {
    const result = await getDb().select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await getDb().select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async insertUser(user: InsertUser): Promise<User> {
    const result = await getDb().insert(users).values(user).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();

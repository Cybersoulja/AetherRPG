import { users, type User, type InsertUser } from "@shared/schema";

/**
 * Interface for storage operations.
 */
export interface IStorage {
  /**
   * Retrieves a user by their ID.
   * @param {number} id - The user's ID.
   * @returns {Promise<User | undefined>} A promise that resolves to the user or undefined if not found.
   */
  getUser(id: number): Promise<User | undefined>;

  /**
   * Retrieves a user by their username.
   * @param {string} username - The user's username.
   * @returns {Promise<User | undefined>} A promise that resolves to the user or undefined if not found.
   */
  getUserByUsername(username: string): Promise<User | undefined>;

  /**
   * Creates a new user.
   * @param {InsertUser} user - The user data to insert.
   * @returns {Promise<User>} A promise that resolves to the newly created user.
   */
  createUser(user: InsertUser): Promise<User>;
}

/**
 * In-memory storage implementation for demonstration purposes.
 */
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  /**
   * @inheritdoc
   */
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  /**
   * @inheritdoc
   */
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  /**
   * @inheritdoc
   */
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
}

/**
 * The singleton instance of the storage class.
 * @type {IStorage}
 */
export const storage = new MemStorage();

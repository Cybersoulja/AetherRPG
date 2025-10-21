import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

/**
 * Registers the application's routes.
 * @param {Express} app - The Express application instance.
 * @returns {Promise<Server>} A promise that resolves to the HTTP server.
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}

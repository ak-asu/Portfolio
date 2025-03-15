import express from "express";
import { createServer } from "http";

// This is a simplified version since we don't need API routes for a static portfolio
export async function registerRoutes(app: express.Express) {
  const server = createServer(app);
  return server;
}

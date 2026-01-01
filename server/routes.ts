import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import {
  setupAuth,
  registerAuthRoutes,
  isAuthenticated,
} from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { WebSocketServer, WebSocket } from "ws";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Setup Auth and Object Storage
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);

  // WebSocket Setup
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Map<string, WebSocket>(); // userId -> ws

  wss.on("connection", (ws, req) => {
    // In a real app, parse session from cookie to get userId
    // For demo, we might rely on the client sending a "join" message

    ws.on("message", (data) => {
      const message = JSON.parse(data.toString());
      if (message.type === "join") {
        clients.set(message.userId, ws);
      }
    });

    ws.on("close", () => {
      // Cleanup client
    });
  });

  // Protected Routes Middleware
  const protectedApi = [
    api.chats.list.path,
    api.chats.create.path,
    api.messages.list.path,
    api.messages.send.path,
    api.stories.create.path,
    api.audios.create.path,
  ];

  // Users
  app.get(api.users.search.path, isAuthenticated, async (req, res) => {
    const query = req.query.query as string;
    const users = await storage.searchUsers(query);
    res.json(users);
  });

  app.get(api.users.get.path, isAuthenticated, async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  });

  // =======================
  // /api/chats (SAFE MODE)
  // =======================
  app.get(api.chats.list.path, async (_req, res) => {
    try {
      // Render safe: no auth, no DB
      return res.status(200).json([]);
    } catch (err) {
      console.error("❌ /api/chats ERROR:", err);
      return res.status(200).json([]);
    }
  });

  app.post(api.chats.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.chats.create.input.parse(req.body);
      const chat = await storage.createChat(input, userId);
      res.status(201).json(chat);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // =======================
  // /api/chats (NO AUTH - SAFE)
  // =======================
  app.get(api.chats.get.path, async (_req, res) => {
    try {
      return res.status(200).json([]);
    } catch (err) {
      console.error("❌ /api/chats ERROR:", err);
      return res.status(200).json([]);
    }
  });

  // Messages
  app.get(api.messages.list.path, isAuthenticated, async (req, res) => {
    const messages = await storage.getChatMessages(Number(req.params.chatId));
    res.json(messages);
  });

  app.post(api.messages.send.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.messages.send.input.parse(req.body);
      const message = await storage.createMessage({
        ...input,
        chatId: Number(req.params.chatId),
        senderId: userId,
      });

      // Notify other members via WebSocket
      const members = await storage.getChatMembers(message.chatId);
      members.forEach((memberId) => {
        if (memberId !== userId) {
          const client = clients.get(memberId);
          if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: "new_message", message }));
          }
        }
      });

      res.status(201).json(message);
    } catch (e) {
      console.log(e);
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Stories
  app.get(api.stories.list.path, isAuthenticated, async (req, res) => {
    const stories = await storage.getActiveStories();
    res.json(stories);
  });

  app.post(api.stories.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.stories.create.input.parse(req.body);
      const story = await storage.createStory({
        ...input,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      });
      res.status(201).json(story);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // Audios
  app.get(api.audios.list.path, isAuthenticated, async (req, res) => {
    const audios = await storage.getAudios();
    res.json(audios);
  });

  app.post(api.audios.create.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
      const input = api.audios.create.input.parse(req.body);
      const audio = await storage.createAudio({
        ...input,
        uploaderId: userId,
      });
      res.status(201).json(audio);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}

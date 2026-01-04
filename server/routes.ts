import type { Express } from "express";
import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";

import { storage } from "./storage";
import { api } from "@shared/routes";
import {
  setupAuth,
  registerAuthRoutes,
  isAuthenticated,
} from "./replit_integrations/auth";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

// ==================================================
// REGISTER ROUTES
// ==================================================
export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // -------------------------
  // Auth + Storage
  // -------------------------
  await setupAuth(app);
  registerAuthRoutes(app);
  registerObjectStorageRoutes(app);
  // ===============================
  // CHAT POLLING API
  // ===============================
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages();
      // 👆 agar tum Drizzle use kar rahe ho,
      // to yahan wahi function use karo jo messages laata hai

      res.status(200).json(messages);
    } catch (e) {
      console.log("polling error, ignore");
      res.status(200).json([]); // IMPORTANT
    }
  });

  // ==================================================
  // WebSocket Setup
  // ==================================================
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  const clients = new Map<string, WebSocket>(); // userId -> ws

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url || "", "http://localhost");
    const userId = url.searchParams.get("userId") || "demo-user";

    clients.set(userId, ws);

    ws.on("close", () => {
      clients.delete(userId);
    });
  });

  // ==================================================
  // USERS
  // ==================================================
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

  // ==================================================
  // CHATS (SAFE MODE)
  // ==================================================
  app.get(api.chats.list.path, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const chats = await storage.getUserChats(userId);
      return res.status(200).json(chats);
    } catch (err) {
      console.error("Failed to fetch chats", err);
      return res.status(200).json([]);
    }
  });

  app.post(api.chats.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub || "demo-user";
      const input = api.chats.create.input.parse(req.body);
      const chat = await storage.createChat(input, userId);
      res.status(201).json(chat);
    } catch {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // ==================================================
  // MESSAGES
  // ==================================================

  // GET messages
  app.get(api.messages.list.path, isAuthenticated, async (req: any, res) => {
    try {
      const chatId = Number(req.params.chatId);
      if (!chatId || Number.isNaN(chatId)) return res.json([]);

      const messages = await storage.getChatMessages(chatId);
      return res.json(messages);
    } catch {
      return res.json([]); // NEVER 502
    }
  });

  // POST message
  app.post(api.messages.send.path, isAuthenticated, async (req: any, res) => {
    try {
      const chatId = Number(req.params.chatId);
      const userId = req.user?.claims?.sub || "demo-user";

      console.log("POST ROUTE chatId =", chatId);
      console.log("POST ROUTE body =", req.body);

      if (!chatId || Number.isNaN(chatId)) {
        return res.status(400).json({ message: "Invalid chatId" });
      }

      const input = api.messages.send.input.parse(req.body);

      const message = await storage.createMessage({
        chatId,
        senderId: userId,
        content: input.content,
      });

      // -------------------------
      // Realtime notify (SAFE)
      // -------------------------
      try {
        const members = await storage.getChatMembers(chatId);

        members.forEach((memberId) => {
          if (memberId !== userId) {
            console.log(
              "📤 notify member:",
              memberId,
              "client exists:",
              clients.has(memberId),
            );
            const client = clients.get(memberId);
            if (client && client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "new_message",
                  message,
                }),
              );
            }
          }
        });
      } catch {
        // ignore websocket errors (Render safety)
      }

      return res.status(201).json(message);
    } catch {
      return res.status(400).json({ message: "Invalid input" });
    }
  });

  // ==================================================
  // STORIES
  // ==================================================
  app.get(api.stories.list.path, isAuthenticated, async (_req, res) => {
    const stories = await storage.getActiveStories();
    res.json(stories);
  });

  app.post(api.stories.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.stories.create.input.parse(req.body);
      const story = await storage.createStory({
        ...input,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      res.status(201).json(story);
    } catch {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  // ==================================================
  // AUDIOS
  // ==================================================
  app.get(api.audios.list.path, isAuthenticated, async (_req, res) => {
    const audios = await storage.getAudios();
    res.json(audios);
  });

  app.post(api.audios.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const input = api.audios.create.input.parse(req.body);
      const audio = await storage.createAudio({
        ...input,
        uploaderId: userId,
      });
      res.status(201).json(audio);
    } catch {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  return httpServer;
}

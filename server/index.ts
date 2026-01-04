import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { db } from "./db";
import { users } from "@shared/schema";

const app = express();
const httpServer = createServer(app);

// TEMP: ensure at least one extra user exists for chat testing
async function ensureDummyUser() {
  try {
    await db
      .insert(users)
      .values({
        id: "test-user-2",
        email: "test2@bm.com",
        firstName: "Test",
        lastName: "User",
      })
      .onConflictDoNothing();

    console.log("✅ Dummy user ensured");
  } catch (err) {
    console.error("❌ Failed to insert dummy user", err);
  }
}

ensureDummyUser();

// =======================
// WebSocket setup
// =======================
const wss = new WebSocketServer({
  server: httpServer,
  path: "/ws",
});

const clients = new Map<string, WebSocket>();

wss.on("connection", (ws) => {
  console.log("🟢 WebSocket connected");

  ws.on("message", (data) => {
    let msg: any;

    try {
      msg = JSON.parse(data.toString());
    } catch {
      return; // ignore non-JSON (ping etc.)
    }

    // ❤️ heartbeat
    if (msg.type === "ping") {
      return;
    }

    // ✅ register user
    if (msg.type === "register" && msg.userId) {
      clients.set(msg.userId, ws);
      console.log("✅ WS registered:", msg.userId);
      return;
    }
  });

  ws.on("close", () => {
    console.log("⚪ WebSocket disconnected");

    // cleanup
    for (const [userId, socket] of clients.entries()) {
      if (socket === ws) {
        clients.delete(userId);
      }
    }
  });

  ws.on("error", (err) => {
    console.error("❌ WS error", err);
  });
});

httpServer.keepAliveTimeout = 120000;
httpServer.headersTimeout = 120000;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));
// ✅ Root health check (Render fix)

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    // ❌ throw err;  ← पूरी तरह हटा दो
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();

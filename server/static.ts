import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const publicPath = path.join(process.cwd(), "dist", "public");

  // serve static assets
  app.use(express.static(publicPath));

  // SPA fallback (React / Vite)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

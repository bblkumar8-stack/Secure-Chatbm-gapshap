import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const publicPath = path.resolve(process.cwd(), "..", "dist", "public");

  console.log("📦 Static path:", publicPath);

  app.use(express.static(publicPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

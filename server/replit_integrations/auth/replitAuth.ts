import type { Express, RequestHandler } from "express";

export async function setupAuth(app: Express) {
  console.log("Auth disabled for Render deployment");
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  return next();
};

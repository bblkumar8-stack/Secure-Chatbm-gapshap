import type { Express, RequestHandler } from "express";

export async function setupAuth(app: Express) {
  console.log("Auth disabled. Using dummy user.");
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // Dummy user so app code doesn't crash
  req.user = {
    id: "demo-user",
    email: "demo@example.com",
    claims: {
      sub: "demo-user",
      email: "demo@example.com",
    },
  };

  return next();
};

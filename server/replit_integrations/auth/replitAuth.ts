import type { Express, RequestHandler } from "express";

export async function setupAuth(app: Express) {
  console.log("Auth disabled. Using dummy user.");

  // Dummy login route (optional, safe)
  app.get("/api/login", (_req, res) => {
    res.redirect("/");
  });

  app.get("/api/logout", (_req, res) => {
    res.redirect("/");
  });

  // IMPORTANT: frontend yahin se user data leta hai
  app.get("/api/auth/user", (_req, res) => {
    res.json({
      id: "demo-user",
      email: "demo@bmgapshap.com",
      firstName: "BM",
      lastName: "GapShap",
      profileImageUrl: "https://ui-avatars.com/api/?name=BM+GapShap",
    });
  });
}

// Middleware so protected routes don't fail
export const isAuthenticated: RequestHandler = (_req: any, _res, next) => {
  return next();
};

import { defineConfig } from "drizzle-kit";

// ❗ Render / production में crash मत करो
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, drizzle config will be idle");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});

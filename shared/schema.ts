import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Import auth models
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  name: text("name"), // Null for DMs
  type: text("type").notNull().default("dm"), // 'dm' | 'group'
  iconUrl: text("icon_url"),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMembers = pgTable("chat_members", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  userId: text("user_id").notNull(), // References auth users.id (which is string/uuid)
  isAdmin: boolean("is_admin").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  senderId: text("sender_id").notNull(),
  content: text("content"),
  type: text("type").notNull().default("text"), // 'text' | 'image' | 'video' | 'audio' | 'file'
  mediaUrl: text("media_url"),
  metadata: jsonb("metadata"), // Duration, file size, etc.
  createdAt: timestamp("created_at").defaultNow(),
  readBy: text("read_by").array(), // Array of user IDs who read the message
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  mediaUrl: text("media_url").notNull(),
  type: text("type").notNull().default("image"), // 'image' | 'video' | 'text'
  content: text("content"), // Caption or text content
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const audios = pgTable("audios", {
  id: serial("id").primaryKey(),
  uploaderId: text("uploader_id").notNull(),
  title: text("title").notNull(),
  artist: text("artist"),
  url: text("url").notNull(),
  coverUrl: text("cover_url"),
  duration: integer("duration"), // Seconds
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const chatsRelations = relations(chats, ({ many }) => ({
  members: many(chatMembers),
  messages: many(messages),
}));

export const chatMembersRelations = relations(chatMembers, ({ one }) => ({
  chat: one(chats, {
    fields: [chatMembers.chatId],
    references: [chats.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertChatSchema = createInsertSchema(chats).omit({ id: true, createdAt: true, lastMessageAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, readBy: true });
export const insertStorySchema = createInsertSchema(stories).omit({ id: true, createdAt: true });
export const insertAudioSchema = createInsertSchema(audios).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type Audio = typeof audios.$inferSelect;
export type User = typeof users.$inferSelect;

export type CreateChatRequest = {
  type: "dm" | "group";
  name?: string;
  memberIds: string[]; // For DMs (1 other person) or Groups (multiple)
  iconUrl?: string;
};

export type CreateMessageRequest = z.infer<typeof insertMessageSchema>;
export type CreateStoryRequest = z.infer<typeof insertStorySchema>;
export type CreateAudioRequest = z.infer<typeof insertAudioSchema>;

export type ChatResponse = Chat & {
  members?: { userId: string; isAdmin: boolean }[];
  lastMessage?: Message;
  otherUser?: User; // For DMs, helper to show the other person
};

export type MessageResponse = Message & {
  sender?: User;
};

import { db } from "./db";
import {
  chats,
  chatMembers,
  messages,
  stories,
  audios,
  users,
  type CreateChatRequest,
  type CreateMessageRequest,
  type CreateStoryRequest,
  type CreateAudioRequest,
  type Chat,
  type Message,
  type Story,
  type Audio,
  type User,
} from "@shared/schema";
import { eq, and, desc, inArray, ilike } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export interface IStorage {
  // Users
  searchUsers(query: string): Promise<User[]>;
  getUser(id: string): Promise<User | undefined>;

  // Chats
  getUserChats(userId: string): Promise<any[]>;
  getChat(chatId: number): Promise<Chat | undefined>;
  createChat(chat: CreateChatRequest, creatorId: string): Promise<Chat>;
  getChatMembers(chatId: number): Promise<string[]>;

  // Messages
  getChatMessages(chatId: number): Promise<Message[]>;
  createMessage(message: CreateMessageRequest): Promise<Message>;

  // Stories
  getActiveStories(): Promise<Story[]>;
  createStory(story: CreateStoryRequest): Promise<Story>;

  // Audio
  getAudios(): Promise<Audio[]>;
  createAudio(audio: CreateAudioRequest): Promise<Audio>;
}

export class DatabaseStorage implements IStorage {
  async searchUsers(query: string): Promise<User[]> {
    console.log("SEARCH USERS API HIT");
      // TEMP: testing ke liye saare users dikha do
    return await db.select().from(users).limit(10);
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserChats(userId: string): Promise<any[]> {
    // Get all chat IDs user is a member of
    const memberships = await db
      .select()
      .from(chatMembers)
      .where(eq(chatMembers.userId, userId));
    const chatIds = memberships.map((m) => m.chatId);

    if (chatIds.length === 0) return [];

    const userChats = await db
      .select()
      .from(chats)
      .where(inArray(chats.id, chatIds))
      .orderBy(desc(chats.lastMessageAt));

    // For DMs, fetch the other user
    const detailedChats = await Promise.all(
      userChats.map(async (chat) => {
        if (chat.type === "dm") {
          const members = await db
            .select()
            .from(chatMembers)
            .where(eq(chatMembers.chatId, chat.id));
          const otherMember = members.find((m) => m.userId !== userId);
          if (otherMember) {
            const [user] = await db
              .select()
              .from(users)
              .where(eq(users.id, otherMember.userId));
            return { ...chat, otherUser: user };
          }
        }
        return chat;
      }),
    );

    return detailedChats;
  }

  async getChat(chatId: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
    return chat;
  }

  async createChat(req: CreateChatRequest, creatorId: string): Promise<Chat> {
    const [chat] = await db
      .insert(chats)
      .values({
        type: req.type,
        name: req.name,
        iconUrl: req.iconUrl,
      })
      .returning();

    const members = [...new Set([...req.memberIds, creatorId])];

    await db.insert(chatMembers).values(
      members.map((userId) => ({
        chatId: chat.id,
        userId,
        isAdmin: userId === creatorId,
      })),
    );

    return chat;
  }

  async getChatMembers(chatId: number): Promise<string[]> {
    const members = await db
      .select()
      .from(chatMembers)
      .where(eq(chatMembers.chatId, chatId));
    return members.map((m) => m.userId);
  }

  async getChatMessages(chatId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }

  async createMessage(req: CreateMessageRequest): Promise<Message> {
    const [message] = await db.insert(messages).values(req).returning();

    // Update chat last message timestamp
    await db
      .update(chats)
      .set({ lastMessageAt: new Date() })
      .where(eq(chats.id, req.chatId));

    return message;
  }

  async getActiveStories(): Promise<Story[]> {
    const now = new Date();
    // In a real app, filter by friends/contacts. For now, showing all active stories.
    return await db.select().from(stories).where(desc(stories.createdAt));
    // .where(gt(stories.expiresAt, now))
  }

  async createStory(req: CreateStoryRequest): Promise<Story> {
    const [story] = await db.insert(stories).values(req).returning();
    return story;
  }

  async getAudios(): Promise<Audio[]> {
    return await db.select().from(audios).orderBy(desc(audios.createdAt));
  }

  async createAudio(req: CreateAudioRequest): Promise<Audio> {
    const [audio] = await db.insert(audios).values(req).returning();
    return audio;
  }
}

export const storage = new DatabaseStorage();

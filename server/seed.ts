import { db } from "./db";
import { chats, messages, stories, audios, chatMembers } from "@shared/schema";
import { users } from "@shared/models/auth";

async function seed() {
  console.log("Seeding database...");

  // Create some users (mocking auth users since we can't easily create them with passwords here, 
  // but we can insert them if they don't exist for display purposes)
  // Note: Replit Auth users are created on login. We can't easily seed "login-able" users.
  // But we can create some dummy users for "other people" in the app.
  
  const demoUsers = [
    {
      email: "alice@example.com",
      firstName: "Alice",
      lastName: "Wonderland",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    },
    {
      email: "bob@example.com",
      firstName: "Bob",
      lastName: "Builder",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    },
    {
      email: "charlie@example.com",
      firstName: "Charlie",
      lastName: "Chocolate",
      profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    }
  ];

  const createdUsers = [];
  for (const u of demoUsers) {
    const [user] = await db.insert(users).values(u as any).onConflictDoNothing().returning();
    if (user) createdUsers.push(user);
  }

  if (createdUsers.length === 0) {
    console.log("Users already exist or failed to create.");
    return;
  }

  // Create a public group chat
  const [groupChat] = await db.insert(chats).values({
    name: "General Community",
    type: "group",
    iconUrl: "https://api.dicebear.com/7.x/initials/svg?seed=GC"
  }).returning();

  // Add users to group
  for (const user of createdUsers) {
    await db.insert(chatMembers).values({
      chatId: groupChat.id,
      userId: user.id,
      isAdmin: false
    });
  }

  // Add some messages
  await db.insert(messages).values([
    {
      chatId: groupChat.id,
      senderId: createdUsers[0].id,
      content: "Welcome to BmGapshap! 👋",
      type: "text"
    },
    {
      chatId: groupChat.id,
      senderId: createdUsers[1].id,
      content: "Hey everyone! This app looks cool.",
      type: "text"
    }
  ]);

  // Add some sample audio
  await db.insert(audios).values([
    {
      uploaderId: createdUsers[0].id,
      title: "Lo-Fi Beats",
      artist: "Chill Guy",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      coverUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop"
    },
    {
      uploaderId: createdUsers[1].id,
      title: "Synthwave",
      artist: "Retro vibes",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      coverUrl: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?w=400&h=400&fit=crop"
    }
  ]);

  console.log("Seeding complete!");
}

seed().catch(console.error);

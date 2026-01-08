import { useState } from "react";
import { useChats } from "@/hooks/use-chats";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Search, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { ChatWindow } from "./ChatWindow";

export default function HomePage() {
  const { data: chats, isLoading } = useChats();
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  // get chatId from URL
  const params = new URLSearchParams(window.location.search);
  const activeChatId = params.get("chatId")
    ? Number(params.get("chatId"))
    : null;

  const q = search.toLowerCase();

  const filteredChats = chats?.filter((chat) => {
    return (
      chat.name?.toLowerCase().includes(q) ||
      chat.otherUser?.username?.toLowerCase().includes(q) ||
      chat.otherUser?.firstName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-background md:pl-20 lg:pl-64">
      {/* Sidebar */}
      <div
        className={`flex-col w-full md:w-80 lg:w-96 border-r bg-background
        ${activeChatId ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Chats</h1>
            <button className="p-2 hover:bg-muted rounded-full">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chats"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-md border outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-center text-muted-foreground">
              Loading chats...
            </p>
          ) : filteredChats?.length === 0 ? (
            <p className="p-6 text-center text-muted-foreground">
              No chats found
            </p>
          ) : (
            filteredChats?.map((chat) => {
              const isDM = chat.type === "dm";
              const displayName = isDM
                ? chat.otherUser?.firstName || chat.otherUser?.username
                : chat.name;

              const lastMsg = chat.lastMessage;
              const isActive = activeChatId === chat.id;

              return (
                <Link
                  key={chat.id}
                  href={`/?chatId=${chat.id}`}
                  className={`block border-b px-4 py-3 transition
                    ${isActive ? "bg-primary/10" : "hover:bg-muted"}`}
                >
                  <div className="flex justify-between mb-1">
                    <h3 className="font-semibold truncate">{displayName}</h3>
                    {lastMsg && (
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(lastMsg.createdAt), "h:mm a")}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground truncate">
                    {lastMsg
                      ? lastMsg.type === "image"
                        ? "📷 Photo"
                        : lastMsg.content
                      : "No messages yet"}
                  </p>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div
        className={`flex-1 flex flex-col bg-muted/30
        ${!activeChatId ? "hidden md:flex" : "flex"}`}
      >
        {activeChatId ? (
          <ChatWindow chatId={activeChatId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center animate-enter">
            <div className="w-64 h-64 bg-primary/10 rounded-full flex items-center justify-center mb-8">
              <img
                src="/logo512.png"
                alt="BmGapshap"
                className="w-48 h-48 object-contain bg-white p-2 rounded-xl"
              />
            </div>

            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              Welcome to BmGapshap
            </h2>
            <p className="max-w-md">
              Select a chat from the sidebar or start a new conversation to get
              chatting. Don't forget to check out the Jukebox!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

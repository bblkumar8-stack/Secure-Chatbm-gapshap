import { useState } from "react";
import { useChats } from "@/hooks/use-chats";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, MoreVertical, CheckCheck } from "lucide-react";
import { UserSearch } from "@/components/UserSearch";
import { format } from "date-fns";
import { ChatWindow } from "./ChatWindow";

export default function HomePage() {
  const { data: chats, isLoading } = useChats();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [location] = useLocation();

  // Parse chatId from query string
  const params = new URLSearchParams(window.location.search);
  const activeChatId = params.get("chatId")
    ? parseInt(params.get("chatId")!)
    : null;

  console.log("HOME PAGE activeChatId =", activeChatId);

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
      {/* Chat List Sidebar - Hidden on mobile if chat is active */}
      <div
        className={`
        flex-col w-full md:w-80 lg:w-96 border-r bg-background/50 backdrop-blur-sm
        ${activeChatId ? "hidden md:flex" : "flex"}
      `}
      >
        <div className="p-4 space-y-4 border-b bg-background/95 backdrop-blur z-10 sticky top-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold">Chats</h1>
            <div className="flex items-center gap-2">
              <UserSearch />
              <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search or start new chat"
              className="pl-9 bg-muted/50 border-none focus:ring-1 focus:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading chats...
            </div>
          ) : filteredChats?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No chats yet.</p>
              <p className="text-sm mt-2">Start a conversation with someone!</p>
            </div>
          ) : (
            filteredChats?.map((chat) => {
              // Determine display name and image
              const isDM = chat.type === "dm";
              const displayName = isDM
                ? chat.otherUser?.firstName || chat.otherUser?.username
                : chat.name;
              const displayImage = isDM
                ? chat.otherUser?.profileImageUrl
                : chat.iconUrl;
              const lastMsg = chat.lastMessage;
              const isActive = activeChatId === chat.id;

              return (
                <Link
                  key={chat.id}
                  href={`/?chatId=${chat.id}`}
                  className={`
                    flex items-center gap-3 p-4 transition-colors cursor-pointer border-b border-border/40
                    ${isActive ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/50 border-l-4 border-l-transparent"}
                  `}
                >
                  <Avatar className="h-12 w-12 border border-border/50">
                    <AvatarImage src={displayImage || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {displayName?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3
                        className={`font-semibold truncate ${isActive ? "text-primary" : "text-foreground"}`}
                      >
                        {displayName}
                      </h3>
                      {lastMsg && (
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {format(new Date(lastMsg.createdAt), "h:mm a")}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate pr-2">
                        {lastMsg ? (
                          <>
                            {lastMsg.senderId === user?.id && (
                              <span className="mr-1">You:</span>
                            )}
                            {lastMsg.type === "image"
                              ? "📷 Photo"
                              : lastMsg.content}
                          </>
                        ) : (
                          <span className="italic text-xs">
                            No messages yet
                          </span>
                        )}
                      </p>
                      {/* Unread badge placeholder - logic can be added later */}
                      {/* <span className="w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">2</span> */}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`flex-1 bg-muted/30 relative flex flex-col ${!activeChatId ? "hidden md:flex" : "flex"}`}
      >
        {activeChatId ? (
          <ChatWindow chatId={activeChatId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center animate-enter">
            <div className="w-64 h-64 bg-primary/5 rounded-full flex items-center justify-center mb-8">
              <img
                src="https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2hhdHxlbnwwfHwwfHx8MA%3D%3D"
                alt="Select Chat"
                className="w-48 h-48 object-cover rounded-full opacity-80 mix-blend-multiply"
              />
              {/* <!-- chatting concept abstract illustration --> */}
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

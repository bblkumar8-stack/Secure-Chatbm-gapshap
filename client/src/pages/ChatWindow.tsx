import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

console.log("CHAT WINDOW FILE LOADED");

export function ChatWindow({ chatId }: { chatId: number }) {
  const { user } = useAuth();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ===============================
  // LOAD MESSAGES (POLLING)
  // ===============================
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`, {
          credentials: "include",
        });
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 4000);

    return () => clearInterval(interval);
  }, [chatId]);

  // ===============================
  // AUTO SCROLL
  // ===============================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===============================
  // SEND MESSAGE (SAFE)
  // ===============================
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim()) return;

    try {
      await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: inputText }),
      });

      setInputText("");
    } catch (err) {
      console.error("❌ Failed to send message", err);
    }
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-card">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <Avatar className="h-10 w-10">
          <AvatarImage />
          <AvatarFallback>C</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="font-semibold">Chat</h2>
          <p className="text-xs text-muted-foreground">Online</p>
        </div>

        <Button variant="ghost" size="icon">
          <Video />
        </Button>
        <Button variant="ghost" size="icon">
          <Phone />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && (
          <div className="text-center text-sm text-muted-foreground">
            Loading messages…
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center text-sm text-muted-foreground">
            No messages yet
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 text-sm rounded-2xl ${
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}
              >
                <p className="break-words">{msg.content}</p>
                <div className="text-[10px] opacity-70 mt-1 text-right">
                  {format(new Date(msg.createdAt), "h:mm a")}
                </div>
              </div>
            </div>
          );
        })}

        {isOtherUserTyping && (
          <div className="text-sm text-muted-foreground animate-pulse">
            typing…
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
        />

        <Button type="submit" disabled={!inputText.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}

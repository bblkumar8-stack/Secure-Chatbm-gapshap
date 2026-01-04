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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ===============================
  // POLLING (ONLY SOURCE OF TRUTH)
  // ===============================
  useEffect(() => {
    if (!chatId) return;

    const loadMessages = () => {
      fetch(`/api/chats/${chatId}/messages`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setMessages(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    };

    loadMessages(); // first load
    const interval = setInterval(loadMessages, 4000);

    return () => clearInterval(interval);
  }, [chatId]);

  const handleSend = async () => {
    console.log("HANDLE SEND CLICKED");
    if (!inputText.trim()) return;

    await fetch(`/api/chats/${chatId}/messages`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: inputText,
      }),
    });

    setInputText("");
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
                className={`rounded-xl px-3 py-2 max-w-[70%] text-sm ${
                  isMe ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                <p>{msg.content}</p>
                <div className="text-[10px] opacity-70 text-right mt-1">
                  {format(new Date(msg.createdAt), "h:mm a")}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t">
        <button
          style={{
            padding: "12px 20px",
            background: "red",
            color: "white",
            fontSize: "16px",
          }}
          onClick={() => alert("RAW BUTTON WORKING")}
        >
          RAW TEST BUTTON
        </button>
      </div>




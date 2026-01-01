import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/use-chats";
import { useMessages, useSendMessage } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Paperclip, Smile, MoreVertical, Phone, Video } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useSocket } from "@/hooks/useSocket";

export function ChatWindow({ chatId }: { chatId: number }) {
  const { data: chat, isLoading: chatLoading } = useChat(chatId);
  const { data: messages, isLoading: msgsLoading } = useMessages(chatId);
  const sendMessage = useSendMessage();
  const { user } = useAuth();
  const socket = useSocket();

  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_message") {
        // refetch messages
        window.location.reload();
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket]);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Upload handler for images
  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      // Assuming backend returns uploadURL and we can derive object URL
      // In a real app, ObjectUploader would return the object URL
      // For this demo, let's assume we get the URL from the response
      const objectUrl = file.uploadURL; // This is the presigned PUT URL, not GET URL.
      // Need a way to get the public URL. For now, assuming standard path if public.
      
      // NOTE: In a real implementation, we'd need the final public URL here.
      // For now, let's just use the uploadURL as a placeholder or trigger a refetch
      sendMessage.mutate({
        chatId,
        content: "Shared an image",
        type: "image",
        mediaUrl: objectUrl, // This needs to be the GET url
      });
    }
  };

  if (chatLoading || !chat) return <div className="flex-1 flex items-center justify-center">Loading chat...</div>;

  const isDM = chat.type === "dm";
  const displayName = isDM ? (chat.otherUser?.firstName || chat.otherUser?.username) : chat.name;
  const displayImage = isDM ? chat.otherUser?.profileImageUrl : chat.iconUrl;

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-[#e5ddd5] dark:bg-[#0b141a]">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '400px'
      }} />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 p-3 bg-card border-b shadow-sm">
        <Link href="/" className="md:hidden p-2 -ml-2 hover:bg-muted rounded-full text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Avatar className="h-10 w-10">
          <AvatarImage src={displayImage || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">{displayName?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold truncate">{displayName}</h2>
          <p className="text-xs text-muted-foreground truncate">
            {isDM ? "Online" : `${chat.members?.length || 0} members`}
          </p>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Button variant="ghost" size="icon" className="rounded-full"><Video className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full"><Phone className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground"><MoreVertical className="w-5 h-5" /></Button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {msgsLoading ? (
          <div className="text-center text-sm text-muted-foreground">Loading messages...</div>
        ) : messages?.length === 0 ? (
          <div className="text-center py-10 bg-background/50 backdrop-blur-sm rounded-xl max-w-sm mx-auto shadow-sm mt-10">
            <p className="text-muted-foreground">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages?.map((msg) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div 
                key={msg.id} 
                className={`flex ${isMe ? "justify-end" : "justify-start"} group animate-enter`}
              >
                <div 
                  className={`
                    max-w-[85%] md:max-w-[70%] rounded-2xl p-3 shadow-sm relative
                    ${isMe 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-white dark:bg-gray-800 text-foreground rounded-tl-none border border-border/50"}
                  `}
                >
                  {!isDM && !isMe && (
                    <p className="text-xs font-bold text-accent mb-1 opacity-80">{msg.sender?.firstName || msg.sender?.username}</p>
                  )}
                  
                  {msg.type === 'image' ? (
                     // Placeholder for image logic
                    <div className="rounded-lg bg-black/10 h-48 w-48 flex items-center justify-center text-xs">
                      {msg.content || "Image"}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  
                  <div className={`
                    text-[10px] flex items-center justify-end gap-1 mt-1 opacity-70
                    ${isMe ? "text-primary-foreground/90" : "text-muted-foreground"}
                  `}>
                    {format(new Date(msg.createdAt), 'h:mm a')}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-3 bg-card border-t flex items-end gap-2">
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-10 w-10 shrink-0">
          <Smile className="w-6 h-6" />
        </Button>
        
        {/* Placeholder Upload Button - would be fully wired with ObjectUploader */}
        <Button variant="ghost" size="icon" className="text-muted-foreground rounded-full h-10 w-10 shrink-0">
           <Paperclip className="w-5 h-5" />
        </Button>

        <div className="flex-1 bg-muted/50 rounded-2xl border-transparent focus-within:bg-background focus-within:ring-1 focus-within:ring-primary transition-all flex items-center min-h-[40px] px-4 py-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none focus:outline-none resize-none max-h-32 text-sm custom-scrollbar"
            rows={1}
            style={{ minHeight: '24px' }}
          />
        </div>

        <Button 
          onClick={handleSend} 
          disabled={!inputText.trim() || sendMessage.isPending}
          className={`
            h-10 w-10 rounded-full shrink-0 transition-transform active:scale-95 shadow-md
            ${inputText.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground hover:bg-muted/80"}
          `}
        >
          <Send className="w-5 h-5 ml-0.5" />
        </Button>
      </div>
    </div>
  );
}

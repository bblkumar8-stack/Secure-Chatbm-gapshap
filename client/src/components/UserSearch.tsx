import { useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSearchUsers } from "@/hooks/use-users";
import { useCreateChat } from "@/hooks/use-chats";
import { useLocation } from "wouter";

export function UserSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { data: users, isLoading } = useSearchUsers(query);
  const createChat = useCreateChat();
  const [, setLocation] = useLocation();

  const handleStartChat = (userId: string) => {
    createChat.mutate(
      {
        type: "dm",
        memberIds: [userId],
      },
      {
        onSuccess: (chat) => {
          setOpen(false);
          setLocation(`/?chatId=${chat.id}`);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:text-primary hover:bg-primary/10 rounded-full"
        >
          <UserPlus className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">New Chat</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              className="pl-9 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {isLoading && query && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Searching...
              </p>
            )}

            {users?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {(
                        user.username?.[0] ||
                        user.firstName?.[0] ||
                        "?"
                      ).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {user.firstName
                        ? `${user.firstName} ${user.lastName || ""}`
                        : user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleStartChat(user.id)}
                  disabled={createChat.isPending}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Message
                </Button>
              </div>
            ))}

            {users?.length === 0 && query && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No users found matching "{query}"</p>
              </div>
            )}

            {!query && (
              <div className="text-center py-8 text-muted-foreground opacity-50">
                <Search className="w-12 h-12 mx-auto mb-2 stroke-1" />
                <p>Type to search for people to chat with</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

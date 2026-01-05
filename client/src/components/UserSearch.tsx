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

  const { data: users = [], isLoading } = useSearchUsers(query);
  const createChat = useCreateChat();
  const [, setLocation] = useLocation();

  const q = query.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    if (!q) return true;

    return (
      (user.firstName ?? "").toLowerCase().includes(q) ||
      (user.lastName ?? "").toLowerCase().includes(q) ||
      (user.email ?? "").toLowerCase().includes(q) ||
      (user.username ?? "").toLowerCase().includes(q)
    );
  });

  const handleStartChat = (userId: string) => {
    createChat.mutate(
      {
        type: "dm",
        memberIds: [userId],
      },
      {
        onSuccess: (chat) => {
          setOpen(false);
          setQuery("");
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
          className="text-primary hover:bg-primary/10 rounded-full"
        >
          <UserPlus className="w-6 h-6" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Results */}
          <div className="h-[300px] overflow-y-auto space-y-2">
            {isLoading && query && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Searching...
              </p>
            )}

            {!isLoading && query && filteredUsers.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                No users found
              </p>
            )}

            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {(user.username || user.firstName || "?")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-medium">
                      {user.firstName
                        ? `${user.firstName} ${user.lastName ?? ""}`
                        : user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      @{user.username ?? "user"}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleStartChat(user.id)}
                  disabled={createChat.isPending}
                >
                  Message
                </Button>
              </div>
            ))}

            {!query && (
              <div className="text-center py-10 text-muted-foreground">
                <Search className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Type to search users</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

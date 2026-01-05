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

  const q = query.toLowerCase();

  const filteredUsers = (users ?? []).filter(
    (user) =>
      user.firstName?.toLowerCase().includes(q) ||
      user.lastName?.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q),
  );

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
        <Button variant="ghost" size="icon">
          <UserPlus className="w-6 h-6" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Search people..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="h-[300px] overflow-y-auto space-y-2">
          {isLoading && query && <p>Searching...</p>}

          {!isLoading && query && filteredUsers.length === 0 && (
            <p>No users found</p>
          )}

          {filteredUsers.map((user) => (
            <div key={user.id} className="flex justify-between p-2">
              <div>
                {user.firstName} {user.lastName}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

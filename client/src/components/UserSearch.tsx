import { useState } from "react";
import { Search } from "lucide-react";

type UserSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function UserSearch({
  value,
  onChange,
  placeholder = "Search chats or users",
}: UserSearchProps) {
  const [focused, setFocused] = useState(false);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-colors
        ${focused ? "border-primary" : "border-border"}
        bg-muted`}
    >
      <Search className="h-4 w-4 text-muted-foreground" />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
      />
    </div>
  );
}

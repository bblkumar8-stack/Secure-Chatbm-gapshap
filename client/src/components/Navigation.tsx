import { Link, useLocation } from "wouter";
import { Home, Music, Image, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    {
      href: "/",
      label: "Chats",
      icon: Home,
    },
    {
      href: "/jukebox",
      label: "Jukebox",
      icon: Music,
    },
    {
      href: "/stories",
      label: "Stories",
      icon: Image,
    },
  ];

  return (
    <nav className="hidden md:flex fixed left-0 top-0 h-screen w-20 lg:w-64 flex-col border-r bg-background">
      {/* Logo / Title */}
      <div className="h-16 flex items-center justify-center lg:justify-start px-4 border-b">
        <span className="font-bold text-lg">BmGapshap</span>
      </div>

      {/* Nav Items */}
      <div className="flex-1 flex flex-col gap-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Menu */}
      <div className="p-2 border-t">
        <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
          <MoreVertical className="h-5 w-5" />
          <span className="hidden lg:inline">More</span>
        </button>
      </div>
    </nav>
  );
}

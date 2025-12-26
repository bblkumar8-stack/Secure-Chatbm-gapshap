import { Link, useLocation } from "wouter";
import { MessageSquare, Music, CircleDashed, LogOut, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import appIcon from "@assets/generated_images/app_icon_for_bmgapshap_chat_application.png";

export function Navigation() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", icon: MessageSquare, label: "Chats" },
    { href: "/stories", icon: CircleDashed, label: "Stories" },
    { href: "/jukebox", icon: Music, label: "Jukebox" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-20 lg:w-64 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed left-0 top-0 z-40">
        <div className="p-4 flex items-center gap-3 mb-6">
          <img src={appIcon} alt="Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-primary/20" />
          <span className="hidden lg:block font-display font-bold text-xl tracking-tight text-primary">BmGapshap</span>
        </div>

        <div className="flex-1 flex flex-col gap-2 px-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className={`
                flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"}
              `}>
                <item.icon className={`w-6 h-6 ${isActive ? "text-primary-foreground" : "text-current"}`} />
                <span className="hidden lg:block font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer group" onClick={() => logout()}>
            <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.firstName?.[0] || user?.email?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.firstName || "User"}</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <LogOut className="w-3 h-3" />
                Sign out
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t z-50 pb-safe">
        <div className="flex justify-around items-center p-3">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors">
                <div className={`
                  p-1.5 rounded-full transition-all duration-300
                  ${isActive ? "bg-primary text-primary-foreground translate-y-[-4px] shadow-lg shadow-primary/30" : "text-muted-foreground"}
                `}>
                  <item.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button 
            onClick={() => logout()}
            className="flex flex-col items-center gap-1 p-2 text-muted-foreground hover:text-destructive transition-colors"
          >
            <div className="p-1.5">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Logout</span>
          </button>
        </div>
      </nav>
    </>
  );
}

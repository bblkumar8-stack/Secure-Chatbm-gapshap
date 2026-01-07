import { useEffect, useRef } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Navigation } from "@/components/Navigation";
import { AudioPlayer } from "@/components/AudioPlayer";

// Pages
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import JukeboxPage from "@/pages/JukeboxPage";
import StoriesPage from "@/pages/StoriesPage";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  if (!user) {
    return <Redirect to="/welcome" />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Navigation is rendered inside pages to handle layout specifics (like hidden nav on mobile chat) */}
      <Component />
      <AudioPlayer />
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <Switch>
      <Route path="/welcome">
        {user ? <Redirect to="/" /> : <LandingPage />}
      </Route>

      <Route path="/">{() => <ProtectedRoute component={HomePage} />}</Route>

      <Route path="/jukebox">
        {() => <ProtectedRoute component={JukeboxPage} />}
      </Route>

      <Route path="/stories">
        {() => <ProtectedRoute component={StoriesPage} />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("🟢 WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "new_message") {
          console.log("📩 New message:", data.message);
        }
      } catch (e) {
        console.error("WS parse error", e);
      }
    };

    ws.onerror = (err) => {
      console.error("🔴 WebSocket error", err);
    };

    ws.onclose = () => {
      console.log("⚪ WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
    
    </QueryClientProvider>
  );
}

export default App;

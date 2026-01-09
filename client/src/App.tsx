import { useEffect, useRef } from "react";
import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import HomePage from "@/pages/HomePage";
import LandingPage from "@/pages/LandingPage";
import JukeboxPage from "@/pages/JukeboxPage";
import StoriesPage from "@/pages/StoriesPage";
import NotFound from "@/pages/not-found";
import { useAuth } from "@hooks/use-auth";

function ProtectedRoute({ component: Component }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/welcome" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

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

export default function App() {
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const ws = new WebSocket(`${protocol}://${window.location.host}`);
    wsRef.current = ws;

    return () => ws.close();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

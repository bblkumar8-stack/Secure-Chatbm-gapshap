import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

export function useSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}`;

    console.log("🔌 Connecting WebSocket:", wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");

      socket.send(
        JSON.stringify({
          type: "register",
          userId: "demo-user", // अभी hardcoded ठीक है
        })
      );
    };


    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket closed");
    };

    return () => {
      socket.close();
    };
  }, [user?.id]);

  return socketRef.current;
}


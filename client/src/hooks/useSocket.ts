import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

export function useSocket() {
  const socketRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    if (socketRef.current) return; // 🔥 VERY IMPORTANT

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}/ws`;

    console.log("🔌 Connecting WebSocket:", wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");

      socket.send(
        JSON.stringify({
          type: "register",
          userId: user.id,
        }),
      );
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 WS message:", data);
      } catch {}
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error", err);
    };

    socket.onclose = () => {
      console.log("🔌 WebSocket closed");
      socketRef.current = null;
    };

    const heartbeat = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "ping" }));
      }
    }, 20000);

    return () => {
      clearInterval(heartbeat);
      socket.close();
    };
  }, [user?.id]);

  return socketRef.current;
}

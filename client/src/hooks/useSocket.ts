import { useEffect, useRef } from "react";

export function useSocket() {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}`;

    console.log("🔌 Connecting WebSocket:", wsUrl);

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
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
  }, []);

  return socketRef.current;
}

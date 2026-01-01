import { useEffect, useRef } from "react";

export function useSocket(onMessage: (data: any) => void) {
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}`;

    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("🟢 WebSocket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch {
        console.warn("⚠️ Invalid WebSocket message");
      }
    };

    socket.onerror = (err) => {
      console.error("🔴 WebSocket error", err);
    };

    return () => {
      socket.close();
      console.log("🟡 WebSocket disconnected");
    };
  }, [onMessage]);

  return socketRef;
}

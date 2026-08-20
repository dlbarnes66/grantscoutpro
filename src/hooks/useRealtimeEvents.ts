import { useEffect } from "react";

export function useRealtimeEvents(workspaceId: string, onEvent: (event: any) => void) {
  useEffect(() => {
    const source = new EventSource("/api/realtime/events");

    source.onmessage = (e) => {
      if (e.data === "connected") return;

      try {
        const event = JSON.parse(e.data);

        // Only handle events for this workspace
        if (event.workspaceId !== workspaceId) return;

        onEvent(event);
      } catch {
        console.warn("Bad SSE event:", e.data);
      }
    };

    source.onerror = (err) => {
      console.error("SSE error:", err);
      source.close();
    };

    return () => {
      source.close();
    };
  }, [workspaceId, onEvent]);
}

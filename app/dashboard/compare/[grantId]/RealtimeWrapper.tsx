"use client";

import { useEffect } from "react";

export default function RealtimeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // placeholder for future Pusher integration
  }, []);

  return <>{children}</>;
}

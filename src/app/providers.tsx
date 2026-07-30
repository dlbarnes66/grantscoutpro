"use client";

import { SessionProvider, signOut } from "next-auth/react";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeout);

      // Auto‑logout after 4 hours of inactivity
      timeout = setTimeout(() => {
        signOut({ callbackUrl: "/sign-in" }); // ⭐ correct option
      }, 4 * 60 * 60 * 1000);
    };

    // Reset timer on user activity
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
}

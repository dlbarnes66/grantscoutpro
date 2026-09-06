"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn } from "@clerk/nextjs";
import { Home } from "lucide-react";

const HIDDEN_PATHS = [
  "/home",
  "/",
  "/pricing",
  "/features",
  "/docs",
  "/privacy",
  "/refund",
  "/terms",
];

export default function GlobalHomeButton() {
  const pathname = usePathname();

  if (pathname && HIDDEN_PATHS.includes(pathname)) {
    return null;
  }

  return (
    <SignedIn>
      <Link
        href="/home"
        aria-label="Back to Dashboard"
        style={{
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#11233F",
          color: "#FFFFFF",
          padding: "10px 16px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.15)",
          textDecoration: "none",
          fontSize: "14px",
          fontWeight: 600,
          boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
        }}
      >
        <Home size={16} />
        Dashboard
      </Link>
    </SignedIn>
  );
}

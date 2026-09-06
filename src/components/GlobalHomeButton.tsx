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
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 9999,
          width: "100%",
          background: "#0A1A2F",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          padding: "8px 20px",
        }}
      >
        <Link
          href="/home"
          aria-label="Back to Dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#FFFFFF",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          <Home size={16} />
          Dashboard
        </Link>
      </div>
    </SignedIn>
  );
}

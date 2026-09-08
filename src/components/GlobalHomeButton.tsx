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

// Small floating "back to dashboard" button, reachable from anywhere in the
// app (in particular the document editor, which has no sidebar of its own).
// This used to be a full-width `position: sticky, top: 0, zIndex: 9999` bar
// rendered above every page's own content in the root layout - since pages
// like the workspace shell *also* have their own `sticky top-0` header,
// the two would fight for the same strip of screen on scroll, with this
// one (z-9999) winning and visually burying the page's real title/nav
// bar underneath it. A small fixed corner button can't collide with
// anything else that way, and bottom-left is the one corner nothing else
// in the app currently uses (top-left: sidebar brand, top-right:
// notifications/avatar, bottom-right: the help chat widget).
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
        title="Back to Dashboard"
        className="fixed bottom-6 left-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#0A1A2F] text-white shadow-lg transition-opacity hover:opacity-100"
        style={{ opacity: 0.55 }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.55")}
      >
        <Home size={18} />
      </Link>
    </SignedIn>
  );
}

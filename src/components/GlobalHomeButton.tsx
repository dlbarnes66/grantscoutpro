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

// Workspace pages render their own left-hand nav (<WorkspaceShell>, with a
// "GrantScout Pro" home link at the very top of the sidebar, plus an
// account row pinned to the bottom of that same sidebar). This floating
// corner button used to render on top of those pages too, landing right on
// top of that sidebar's bottom account row - "layered over the nav bar
// instead of being part of it". WorkspaceTopbar now carries its own Home
// link (see that file), so this floating fallback only needs to keep
// showing on the handful of workspace pages that don't use WorkspaceShell
// at all: the document editor/print view, the AI-recommended-grants page,
// and the locked/paywall page.
const WORKSPACE_SHELL_LESS_PATTERNS = [
  /^\/workspace\/[^/]+\/grants\/recommended\/?$/,
  /^\/workspace\/[^/]+\/documents\/(?!new(?:\/|$))[^/]+\/?$/,
  /^\/workspace\/[^/]+\/documents\/(?!new(?:\/|$))[^/]+\/print\/?$/,
  /^\/workspace\/[^/]+\/locked\/?$/,
];

function isCoveredByWorkspaceShell(pathname: string) {
  if (!pathname.startsWith("/workspace/")) return false;
  return !WORKSPACE_SHELL_LESS_PATTERNS.some((re) => re.test(pathname));
}

// Small floating "back to dashboard" button, reachable from anywhere in the
// app that doesn't already have its own nav (in particular the document
// editor, which has no sidebar of its own). This used to be a full-width
// `position: sticky, top: 0, zIndex: 9999` bar rendered above every page's
// own content in the root layout - since pages like the workspace shell
// *also* have their own `sticky top-0` header, the two would fight for the
// same strip of screen on scroll, with this one (z-9999) winning and
// visually burying the page's real title/nav bar underneath it. A small
// fixed corner button can't collide with a *sticky top* header that way,
// but it still needs to stay off pages whose own nav already lives in that
// bottom-left corner - see isCoveredByWorkspaceShell above.
export default function GlobalHomeButton() {
  const pathname = usePathname();

  if (!pathname) return null;
  if (HIDDEN_PATHS.includes(pathname)) return null;
  if (isCoveredByWorkspaceShell(pathname)) return null;

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

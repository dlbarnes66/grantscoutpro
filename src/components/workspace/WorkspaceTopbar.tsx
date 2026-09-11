"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, Building2, Home } from "lucide-react";
import WorkspaceNotificationBell from "./WorkspaceNotificationBell";

export default function WorkspaceTopbar({ title }: { title: string }) {
  const pathname = usePathname();
  // pathname is like /workspace/<id>/... - the bell needs the workspace id
  // regardless of which page we're on.
  const workspaceId = pathname?.split("/")[2];

  // Shows which workspace you're currently in, next to the page title.
  // Several plans allow more than one workspace per account, and until
  // now nothing in the top nav (or anywhere else) told you which one you
  // were looking at - only the URL did.
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId) {
      setWorkspaceName(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/workspaces/${workspaceId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setWorkspaceName(data?.workspace?.name || null);
      })
      .catch(() => {
        if (!cancelled) setWorkspaceName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-white/[0.06] bg-[#0A1A2F]/90 px-8 py-3.5 backdrop-blur">
      <div className="flex min-w-0 items-center gap-3">
        {/* Part of the nav bar itself (rather than a floating button
            elsewhere on the page) so it can't end up layered on top of
            the sidebar's own account row on pages that have one. */}
        <Link
          href="/home"
          aria-label="Back to Dashboard"
          title="Back to Dashboard"
          className="flex shrink-0 items-center justify-center rounded-md border border-white/[0.08] p-1.5 text-slate-300 transition-colors hover:border-white/[0.16] hover:text-white"
        >
          <Home size={14} />
        </Link>
        {workspaceName && (
          <span
            title={workspaceName}
            className="inline-flex max-w-[220px] shrink-0 items-center gap-1.5 truncate rounded-full border border-[#00E5FF]/20 bg-[#00E5FF]/[0.08] px-2.5 py-1 text-[12px] font-medium text-[#00E5FF]"
          >
            <Building2 size={12} className="shrink-0" />
            <span className="truncate">{workspaceName}</span>
          </span>
        )}
        <h1 className="truncate text-[14px] font-medium text-slate-200">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <a
          href="/docs/grant-scout-pro-user-guide.pdf"
          target="_blank"
          rel="noopener noreferrer"
          title="User Guide"
          className="flex items-center gap-1.5 rounded-md border border-white/[0.08] px-2.5 py-1 text-[13px] text-slate-300 transition-colors hover:border-white/[0.16] hover:text-white"
        >
          <BookOpen size={14} />
          <span className="hidden sm:inline">User Guide</span>
        </a>
        {workspaceId && <WorkspaceNotificationBell workspaceId={workspaceId} />}
      </div>
    </header>
  );
}

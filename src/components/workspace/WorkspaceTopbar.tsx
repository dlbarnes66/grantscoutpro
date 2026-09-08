"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import WorkspaceNotificationBell from "./WorkspaceNotificationBell";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

export default function WorkspaceTopbar({ title }: { title: string }) {
  const pathname = usePathname();
  // pathname is like /workspace/<id>/... - the bell needs the workspace id
  // regardless of which page we're on.
  const workspaceId = pathname?.split("/")[2];

  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-white/[0.06] bg-[#0A1A2F]/90 px-8 py-3.5 backdrop-blur">
      <h1 className="text-[14px] font-medium text-slate-200">{title}</h1>

      <div className="flex items-center gap-3">
        {workspaceId && <WorkspaceNotificationBell workspaceId={workspaceId} />}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

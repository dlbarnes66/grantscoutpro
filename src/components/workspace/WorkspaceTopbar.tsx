"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

export default function WorkspaceTopbar({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const pathname = usePathname();
  // pathname is like /workspace/<id>/... - notifications live at
  // /workspace/<id>/notifications regardless of which page we're on.
  const workspaceId = pathname?.split("/")[2];
  const notificationsHref = workspaceId ? `/workspace/${workspaceId}/notifications` : undefined;

  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-white/5 bg-[#0A1A2F]/85 px-8 py-5 backdrop-blur">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {notificationsHref && (
          <Link
            href={notificationsHref}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </Link>
        )}
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}

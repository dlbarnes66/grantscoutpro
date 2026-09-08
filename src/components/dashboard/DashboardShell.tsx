"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { ReactNode } from "react";
import { BookOpen } from "lucide-react";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen bg-[#0A1A2F] text-white">
      <aside className="w-64 bg-[#11233F] p-6">
        <h2 className="mb-6 text-2xl font-bold">
          GrantScout Pro
        </h2>

        <nav className="flex flex-col gap-3">
          <Link href="/home">Dashboard</Link>
          <Link href="/onboarding">Onboarding</Link>
          <Link href="/compare">Compare Grants</Link>
          <Link href="/recommendations">Recommendations</Link>
          <Link href="/workspace">Workspaces</Link>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-[#1F2F4F] p-6">
          <h1 className="text-2xl font-semibold">
            Dashboard
          </h1>

          <div className="flex items-center gap-4">
            <a
              href="/docs/grant-scout-pro-user-guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              title="User Guide"
              className="flex items-center gap-1.5 rounded-md border border-white/[0.08] px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-white/[0.16] hover:text-white"
            >
              <BookOpen size={16} />
              User Guide
            </a>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>

        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ReactNode } from "react";

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

          <UserButton afterSignOutUrl="/" />
        </header>

        <main className="p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
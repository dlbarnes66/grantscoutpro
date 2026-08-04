import React from "react";
import Link from "next/link";
import { WorkspaceProvider } from "./_context/WorkspaceContext";
import { loadWorkspace } from "./_lib/loadWorkspace";
import { auth } from "next-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const workspace = userId ? await loadWorkspace(userId) : null;

  return (
    <WorkspaceProvider
      value={
        workspace ?? {
          workspaceId: null,
          workspaceName: null,
          role: null,
          subscriptionTier: null,
          trialActive: false,
          trialDaysRemaining: null,
          trialLocked: false,
          aiTokensUsed: 0,
          aiCost: 0,
        }
      }
    >
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="flex h-screen">
          {/* SIDEBAR */}
          <aside className="w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur">
            {/* HEADER */}
            <div className="px-4 py-4 border-b border-slate-800">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="h-8 w-8 rounded bg-blue-500" />
                <div>
                  <div className="text-sm font-semibold">GrantScout Pro</div>
                  <div className="text-xs text-slate-400">
                    {workspace?.workspaceName ?? "Workspace"}
                  </div>
                </div>
              </Link>
            </div>

            {/* MAIN NAV */}
            <nav className="mt-4 px-3 space-y-1 text-sm">
              <Link
                href="/dashboard"
                className="block rounded px-2 py-1 hover:bg-slate-800"
              >
                Overview
              </Link>

              <Link
                href="/dashboard/activity"
                className="block rounded px-2 py-1 hover:bg-slate-800"
              >
                Activity
              </Link>

              <Link
                href="/dashboard/grants"
                className="block rounded px-2 py-1 hover:bg-slate-800"
              >
                Grants
              </Link>

              <Link
                href="/dashboard/ai"
                className="block rounded px-2 py-1 hover:bg-slate-800"
              >
                AI Workspace
              </Link>

              <Link
                href="/dashboard/settings"
                className="block rounded px-2 py-1 hover:bg-slate-800"
              >
                Settings
              </Link>
            </nav>

            {/* HELP SECTION */}
            <div className="mt-6 px-3">
              <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
                Help & Support
              </div>

              <nav className="space-y-1 text-sm">
                <Link
                  href="/dashboard/help/manual"
                  className="block rounded px-2 py-1 hover:bg-slate-800"
                >
                  User Manual
                </Link>

                <Link
                  href="/dashboard/help/ai"
                  className="block rounded px-2 py-1 hover:bg-slate-800"
                >
                  AI Help Chat
                </Link>
              </nav>
            </div>

            {/* LOGOUT */}
            <div className="mt-6 px-3">
              <Link
                href="/logout"
                className="block rounded px-2 py-1 bg-red-600 text-white text-center"
              >
                Logout
              </Link>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 flex flex-col">
            <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-3 flex items-center justify-between">
              <div className="text-sm font-medium text-slate-200">
                {workspace?.workspaceName ?? "Workspace dashboard"}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </WorkspaceProvider>
  );
}

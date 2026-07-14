"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  BookmarkIcon,
  FolderIcon,
  BriefcaseIcon,
  SparklesIcon,
  Squares2X2Icon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

//
// Workspace Switcher
//
function WorkspaceSwitcher() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/workspaces");
      const data = await res.json();
      setWorkspaces(data.workspaces);
      setCurrent(data.currentWorkspaceId);
    }
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    window.location.href = `/dashboard?workspaceId=${id}`;
  };

  if (!workspaces.length) return null;

  return (
    <select
      className="border rounded px-2 py-1 text-sm bg-white"
      value={current ?? ""}
      onChange={handleChange}
    >
      {workspaces.map((ws) => (
        <option key={ws.id} value={ws.id}>
          {ws.name}
        </option>
      ))}
    </select>
  );
}

//
// Navigation Items
//
const navItems = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/dashboard/search", label: "Search Grants", icon: MagnifyingGlassIcon },
  { href: "/dashboard/search-history", label: "Search History", icon: ClockIcon },
  { href: "/dashboard/saved-grants", label: "Saved Grants", icon: BookmarkIcon },
  { href: "/dashboard/saved-searches", label: "Saved Searches", icon: FolderIcon },
  { href: "/dashboard/jobs", label: "Jobs", icon: BriefcaseIcon },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: SparklesIcon },
  { href: "/dashboard/compare", label: "Compare", icon: Squares2X2Icon },
  { href: "/dashboard/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r px-6 py-8 hidden md:flex flex-col">
        
        {/* Brand + Workspace */}
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight">GrantRadar</h1>
          <p className="text-xs text-gray-500 mt-1">Founder • GrantDynamics</p>

          <div className="mt-4">
            <WorkspaceSwitcher />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const href = workspaceId
              ? `${item.href}?workspaceId=${workspaceId}`
              : item.href;

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden w-full bg-white border-b px-4 py-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">GrantRadar</h2>

        <div className="flex items-center gap-3">
          <WorkspaceSwitcher />
          <Link href="/dashboard/settings" className="text-sm px-3 py-1 border rounded">
            Settings
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6 md:p-10">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

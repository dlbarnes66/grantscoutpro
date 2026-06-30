"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ArrowUpOnSquareIcon
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/search", label: "Grant Search", icon: MagnifyingGlassIcon },
  { href: "/narratives", label: "Narrative Builder", icon: DocumentTextIcon },
  { href: "/budget", label: "Budget Builder", icon: ChartBarIcon },
  { href: "/risk", label: "Risk & Compliance", icon: ShieldCheckIcon },
  { href: "/submission", label: "Submission", icon: ArrowUpOnSquareIcon },
  { href: "/renewal", label: "Renewal", icon: ArrowPathIcon },
  { href: "/settings", label: "Settings", icon: Cog6ToothIcon }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950/80 backdrop-blur flex flex-col">
      <div className="px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500" />
          <div>
            <div className="text-sm font-semibold tracking-wide">
              GrantScout Pro
            </div>
            <div className="text-xs text-slate-400">
              AI Grant Intelligence
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50"
              ].join(" ")}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-3 border-t border-slate-800 text-xs text-slate-500">
        v1.0 • AI Backend Complete
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const navItems = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "Search Grants", href: "/search", icon: MagnifyingGlassIcon },
  { name: "Search History", href: "/history", icon: ClockIcon },
  { name: "Saved Grants", href: "/saved", icon: BookmarkIcon },
  { name: "Saved Searches", href: "/saved-searches", icon: FolderIcon },
  { name: "Jobs", href: "/jobs", icon: BriefcaseIcon },
  { name: "Recommendations", href: "/recommendations", icon: SparklesIcon },
  { name: "Compare", href: "/compare", icon: Squares2X2Icon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col">
      <div className="text-xl font-bold text-white mb-6 px-2">GrantScout Pro</div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition group ${
                active ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon
                className={`h-5 w-5 transition ${
                  active ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                }`}
              />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  History,
  Bookmark,
  List,
  Briefcase,
  Sparkles,
  GitCompare,
  Settings,
} from "lucide-react";

const links = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/grants", label: "Search Grants", icon: Search },
  { href: "/dashboard/history", label: "Search History", icon: History },
  { href: "/dashboard/saved-grants", label: "Saved Grants", icon: Bookmark },
  { href: "/dashboard/saved-searches", label: "Saved Searches", icon: List },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: Sparkles },
  { href: "/dashboard/compare", label: "Compare", icon: GitCompare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800 p-6 space-y-6">
      <h2 className="text-xl font-bold mb-4">GrantScout Pro</h2>

      <nav className="space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

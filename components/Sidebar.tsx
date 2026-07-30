"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  History,
  Bookmark,
  Save,
  Briefcase,
  Sparkles,
  GitCompare,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface SidebarNavItem {
  name: string;
  href: string;
  icon: (props: React.ComponentProps<"svg">) => JSX.Element;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState<boolean>(true);

  const navItems: SidebarNavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search Grants", href: "/search", icon: Search },
    { name: "Search History", href: "/history", icon: History },
    { name: "Saved Grants", href: "/saved-grants", icon: Bookmark },
    { name: "Saved Searches", href: "/saved-searches", icon: Save },
    { name: "Jobs", href: "/jobs", icon: Briefcase },
    { name: "Recommendations", href: "/recommendations", icon: Sparkles },
    { name: "Compare", href: "/compare", icon: GitCompare },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside
      className={`h-screen bg-white border-r shadow-sm transition-all duration-300 ${
        open ? "w-64" : "w-20"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b">
        <Sparkles className="w-6 h-6 text-blue-600" />
        {open && (
          <span className="text-lg font-semibold text-gray-900">
            GrantScout Pro
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {open && (
                <span className="text-sm font-medium">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full px-2 py-4 border-t">
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full">
          <LogOut className="w-5 h-5" />
          {open && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-6 bg-white border rounded-full w-6 h-6 flex items-center justify-center shadow-sm hover:bg-gray-50"
      >
        {open ? "<" : ">"}
      </button>
    </aside>
  );
}

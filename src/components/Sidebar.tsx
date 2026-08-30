"use client"

import React from "react"; // ⭐ Required for JSX namespace
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HomeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  BookmarkIcon,
  StarIcon,
  Squares2X2Icon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

interface SidebarLink {
  name: string;
  href: string;
  icon: (props: React.ComponentProps<"svg">) => React.ReactNode; // ⭐ FIXED
}

export default function Sidebar() {
  const pathname = usePathname();

  const links: SidebarLink[] = [
    { name: "Home", href: "/dashboard", icon: HomeIcon },
    { name: "Search Grants", href: "/dashboard/search", icon: MagnifyingGlassIcon },
    { name: "Search History", href: "/dashboard/search-history", icon: ClockIcon },
    { name: "Saved Searches", href: "/dashboard/saved-searches", icon: BookmarkIcon },
    { name: "Saved Grants", href: "/dashboard/saved-grants", icon: StarIcon },
    { name: "Compare Grants", href: "/dashboard/compare", icon: Squares2X2Icon },
    { name: "Jobs", href: "/dashboard/jobs", icon: BriefcaseIcon },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white border-r shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-brandBlue">Menu</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ name, href, icon: Icon }) => {
          const active = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                active
                  ? "bg-brandBlue text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-brandBlue"
              }`}
            >
              <Icon className="w-5 h-5" />
              {name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

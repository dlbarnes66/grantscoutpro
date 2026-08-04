"use client";

import React from "react"; // ⭐ Required for JSX.Element / React.ReactNode
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  XMarkIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  BookmarkIcon,
  StarIcon,
  Squares2X2Icon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

interface SidebarLink {
  label: string;
  href: string;
  icon: (props: React.ComponentProps<"svg">) => React.ReactNode; // ⭐ FIXED
}

export default function MobileSidebar() {
  const [open, setOpen] = useState<boolean>(false);
  const pathname = usePathname();

  const links: SidebarLink[] = [
    { label: "Home", href: "/dashboard", icon: HomeIcon },
    { label: "Search Grants", href: "/dashboard/search", icon: MagnifyingGlassIcon },
    { label: "Search History", href: "/dashboard/search-history", icon: ClockIcon },
    { label: "Saved Searches", href: "/dashboard/saved-searches", icon: BookmarkIcon },
    { label: "Saved Grants", href: "/dashboard/saved-grants", icon: StarIcon },
    { label: "Compare Grants", href: "/dashboard/compare", icon: Squares2X2Icon },
    { label: "Jobs", href: "/dashboard/jobs", icon: BriefcaseIcon },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden text-gray-700 hover:text-brandBlue transition"
      >
        <span className="material-icons text-3xl">menu</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        />
      )}

      {/* Slide-in Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-brandBlue">Menu</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 hover:text-brandBlue transition"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {links.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                  active
                    ? "bg-brandBlue text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-brandBlue"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

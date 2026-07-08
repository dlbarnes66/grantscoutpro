"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  const linkClasses = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <nav className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-2xl font-bold text-gray-900">
          GrantScout Pro
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/search" className={linkClasses("/search")}>
            Search
          </Link>

          <Link href="/saved" className={linkClasses("/saved")}>
            Saved Grants
          </Link>

          <Link href="/compare" className={linkClasses("/compare")}>
            Compare
          </Link>

          <Link href="/writer" className={linkClasses("/writer")}>
            Writer
          </Link>
        </div>

        {/* User Menu Placeholder */}
        <div className="hidden md:flex">
          <div className="w-9 h-9 rounded-full bg-gray-300" />
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}

function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded-lg text-sm font-medium transition ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg bg-gray-200"
      >
        ☰
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg p-3 space-y-2">
          <Link href="/search" className={linkClasses("/search")}>
            Search
          </Link>
          <Link href="/saved" className={linkClasses("/saved")}>
            Saved Grants
          </Link>
          <Link href="/compare" className={linkClasses("/compare")}>
            Compare
          </Link>
          <Link href="/writer" className={linkClasses("/writer")}>
            Writer
          </Link>
        </div>
      )}
    </div>
  );
}

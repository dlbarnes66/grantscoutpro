"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileSidebar from "@/components/MobileSidebar";
import UserDropdown from "@/components/UserDropdown";
import NotificationBell from "@/components/NotificationBell";

interface NavLinkProps {
  href: string;
  label: string;
  pathname: string;
}

export default function TopNav() {
  const pathname: string = usePathname();

  return (
    <header className="w-full bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Left: Logo + Mobile Menu */}
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden">
          <MobileSidebar />
        </div>

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brandBlue rounded-md"></div>
          <h1 className="text-xl font-bold text-brandBlue">GrantFlow</h1>
        </Link>
      </div>

      {/* Center: Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-8">
        <NavLink href="/dashboard" label="Home" pathname={pathname} />
        <NavLink href="/dashboard/search" label="Search" pathname={pathname} />
        <NavLink href="/dashboard/compare" label="Compare" pathname={pathname} />
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-6">
        <NotificationBell />

        {/* User Profile Dropdown */}
        <div className="hidden md:block">
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label, pathname }: NavLinkProps) {
  const active = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`font-medium transition ${
        active
          ? "text-brandBlue border-b-2 border-brandBlue pb-1"
          : "text-gray-700 hover:text-brandBlue"
      }`}
    >
      {label}
    </Link>
  );
}

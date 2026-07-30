"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

export default function SettingsBreadcrumbs() {
  const pathname = usePathname();

  const parts = pathname.split("/").filter(Boolean);
  const settingsIndex = parts.indexOf("settings");
  const crumbs =
    settingsIndex === -1 ? [] : parts.slice(settingsIndex);

  const format = (str: string) =>
    str
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  const buildHref = (index: number) =>
    "/dashboard/" + crumbs.slice(0, index + 1).join("/");

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <Link
        href="/dashboard/settings"
        className="flex items-center gap-1 hover:text-brandBlue transition"
      >
        <Cog6ToothIcon className="w-4 h-4" />
        Settings
      </Link>

      {crumbs.slice(1).map((crumb, index) => (
        <div key={crumb} className="flex items-center gap-2">
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />

          <Link
            href={buildHref(index + 1)}
            className={`hover:text-brandBlue transition ${
              index === crumbs.length - 2 ? "font-semibold text-gray-700" : ""
            }`}
          >
            {format(crumb)}
          </Link>
        </div>
      ))}
    </nav>
  );
}

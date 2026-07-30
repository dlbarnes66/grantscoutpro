"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GrantSidebar({
  workspaceId,
  grantId,
}: {
  workspaceId: string;
  grantId: string;
}) {
  const pathname = usePathname();

  const links = [
    {
      label: "Overview",
      href: `/dashboard/${workspaceId}/grant/${grantId}`,
    },
    {
      label: "AI Analysis",
      href: `/dashboard/${workspaceId}/grant/${grantId}/ai`,
    },
    {
      label: "Drafts",
      href: `/dashboard/${workspaceId}/grant/${grantId}/drafts`,
    },
    {
      label: "History",
      href: `/dashboard/${workspaceId}/grant/${grantId}/history`,
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2 w-full">
      <h2 className="text-lg font-semibold mb-2">Grant Navigation</h2>

      <nav className="space-y-1">
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-sm transition ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

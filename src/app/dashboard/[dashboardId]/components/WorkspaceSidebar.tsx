"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();

  const links = [
    {
      label: "Dashboard",
      href: `/dashboard/${workspaceId}`,
    },
    {
      label: "Grants",
      href: `/dashboard/${params.workspaceId}/grants`,
    },
    {
      label: "Saved Grants",
      href: `/dashboard/${workspaceId}/saved`,
    },
    {
      label: "Help Center",
      href: `/dashboard/${workspaceId}/help`,
    },
    {
      label: "Settings",
      href: `/dashboard/${workspaceId}/settings`,
    },
  ];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2 w-full">
      <h2 className="text-lg font-semibold mb-2">Workspace</h2>

      <nav className="space-y-1">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href);

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

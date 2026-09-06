"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export default function WorkspaceSidebar({ workspaceId }: { workspaceId: string }) {
  const pathname = usePathname();
  const base = `/workspace/${workspaceId}`;

  const sections: NavSection[] = [
    {
      label: "",
      items: [{ label: "Overview", href: base, exact: true }],
    },
    {
      label: "Grants",
      items: [
        { label: "Browse Grants", href: `${base}/grants` },
        { label: "Recommended", href: `${base}/grants/recommended` },
        { label: "Search", href: `${base}/search` },
        { label: "Search Analytics", href: `${base}/analytics/search` },
      ],
    },
    {
      label: "Documents",
      items: [
        { label: "All Documents", href: `${base}/documents`, exact: true },
        { label: "New Document", href: `${base}/documents/new` },
        { label: "Upload", href: `${base}/upload` },
      ],
    },
    {
      label: "AI Tools",
      items: [
        { label: "Assistant Chat", href: `${base}/chat` },
        { label: "Location Intelligence", href: `${base}/intelligence` },
        { label: "AI Insights", href: `${base}/insights` },
      ],
    },
    {
      label: "Workspace",
      items: [
        { label: "Activity", href: `${base}/activity` },
        { label: "Notifications", href: `${base}/notifications` },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Usage", href: `${base}/usage` },
        { label: "Billing", href: `${base}/workspace-billing` },
        { label: "Settings", href: `${base}/settings` },
        { label: "Admin", href: `${base}/admin` },
      ],
    },
  ];

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  }

  return (
    <aside className="w-64 shrink-0 bg-[#11233F] p-6 flex flex-col gap-6 overflow-y-auto">
      <Link href={base} className="text-2xl font-bold mb-2">
        Workspace
      </Link>

      <nav className="flex flex-col gap-5 text-sm">
        {sections.map((section) => (
          <div key={section.label || "root"} className="flex flex-col gap-1">
            {section.label && (
              <p className="text-xs uppercase tracking-wide text-slate-500 mb-1 px-2">
                {section.label}
              </p>
            )}

            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-md px-2 py-2 transition ${
                  isActive(item)
                    ? "bg-[#0A1A2F] text-[#00E5FF] font-medium"
                    : "text-slate-200 hover:text-[#00E5FF] hover:bg-[#0A1A2F]/60"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

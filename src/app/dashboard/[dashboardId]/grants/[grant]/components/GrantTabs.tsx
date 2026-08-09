"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GrantTabs({
  workspaceId,
  grantId,
  active,
}: {
  workspaceId: string;
  grantId: string;
  active: string;
}) {
  const pathname = usePathname();

  const tabs = [
    { key: "overview", label: "Overview", href: `/dashboard/${workspaceId}/grant/${grantId}` },
    { key: "ai", label: "AI Analysis", href: `/dashboard/${workspaceId}/grant/${grantId}/ai` },
    { key: "eligibility", label: "Eligibility", href: `/dashboard/${workspaceId}/grant/${grantId}#eligibility` },
    { key: "funding", label: "Funding", href: `/dashboard/${workspaceId}/grant/${grantId}#funding` },
    { key: "documents", label: "Documents", href: `/dashboard/${workspaceId}/grant/${grantId}#documents` },
    { key: "drafts", label: "Drafts", href: `/dashboard/${workspaceId}/grant/${grantId}/drafts` },
    { key: "history", label: "History", href: `/dashboard/${workspaceId}/grant/${grantId}/history` },
  ];

  return (
    <div className="flex gap-2 border-b border-gray-200 pb-2">
      {tabs.map((tab) => {
        const isActive =
          active === tab.key ||
          pathname === tab.href ||
          pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`px-3 py-1 text-sm rounded-md transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

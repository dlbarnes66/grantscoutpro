"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  XMarkIcon,
  Cog6ToothIcon,
  UserIcon,
  BellIcon,
  CreditCardIcon,
  KeyIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon,
  ServerIcon,
  PuzzlePieceIcon,
  LinkIcon,
  CodeBracketIcon,
  SparklesIcon,
  LifebuoyIcon,
  ScaleIcon,
  SwatchIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

export default function MobileSettingsSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = [
    { label: "Account", href: "/dashboard/settings/account", icon: UserIcon },
    { label: "Notifications", href: "/dashboard/settings/notifications", icon: BellIcon },
    { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCardIcon },
    { label: "API Keys", href: "/dashboard/settings/api-keys", icon: KeyIcon },
    { label: "Team", href: "/dashboard/settings/team", icon: UserGroupIcon },
    { label: "Roles & Permissions", href: "/dashboard/settings/roles", icon: ShieldCheckIcon },
    { label: "Organization", href: "/dashboard/settings/organization", icon: BuildingOfficeIcon },
    { label: "Audit Logs", href: "/dashboard/settings/audit-logs", icon: ClipboardDocumentListIcon },
    { label: "System Status", href: "/dashboard/settings/system-status", icon: ServerIcon },
    { label: "Integrations", href: "/dashboard/settings/integrations", icon: PuzzlePieceIcon },
    { label: "Webhooks", href: "/dashboard/settings/webhooks", icon: LinkIcon },
    { label: "Developer Docs", href: "/dashboard/settings/developers", icon: CodeBracketIcon },
    { label: "Changelog", href: "/dashboard/settings/changelog", icon: SparklesIcon },
    { label: "Support", href: "/dashboard/settings/support", icon: LifebuoyIcon },
    { label: "Legal & Compliance", href: "/dashboard/settings/legal", icon: ScaleIcon },
    { label: "Branding & Theme", href: "/dashboard/settings/branding", icon: SwatchIcon },
    { label: "Data Export & Import", href: "/dashboard/settings/data", icon: ArrowDownTrayIcon },
  ];

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center gap-2 text-gray-700 hover:text-brandBlue transition"
      >
        <Cog6ToothIcon className="w-6 h-6" />
        <span className="font-medium">Settings</span>
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
          <h2 className="text-xl font-bold text-brandBlue">Settings</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 hover:text-brandBlue transition"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {nav.map(({ label, href, icon: Icon }) => {
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex">
      {/* LEFT SIDEBAR */}
      <aside className="w-72 bg-white border-r p-6 space-y-6 hidden md:block">
        <h2 className="text-2xl font-bold text-brandBlue">Settings</h2>

        <nav className="space-y-1">
          {nav.map(({ label, href, icon: Icon }) => {
            const active = pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${
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

      {/* MAIN CONTENT */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

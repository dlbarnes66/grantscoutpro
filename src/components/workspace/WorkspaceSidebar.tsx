"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Sparkles,
  Search,
  BarChart3,
  FileText,
  FilePlus2,
  Upload,
  MessageSquare,
  MapPin,
  Lightbulb,
  Activity,
  Bell,
  Gauge,
  CreditCard,
  Puzzle,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
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
      items: [{ label: "Overview", href: base, icon: LayoutDashboard, exact: true }],
    },
    {
      label: "Grants",
      items: [
        { label: "Browse Grants", href: `${base}/grants`, icon: Landmark },
        { label: "Recommended", href: `${base}/grants/recommended`, icon: Sparkles },
        { label: "Search", href: `${base}/search`, icon: Search },
        { label: "Search Analytics", href: `${base}/analytics/search`, icon: BarChart3 },
      ],
    },
    {
      label: "Documents",
      items: [
        { label: "All Documents", href: `${base}/documents`, icon: FileText, exact: true },
        { label: "New Document", href: `${base}/documents/new`, icon: FilePlus2 },
        { label: "Upload", href: `${base}/upload`, icon: Upload },
      ],
    },
    {
      label: "AI Tools",
      items: [
        { label: "Assistant Chat", href: `${base}/chat`, icon: MessageSquare },
        { label: "Location Intelligence", href: `${base}/intelligence`, icon: MapPin },
        { label: "AI Insights", href: `${base}/insights`, icon: Lightbulb },
      ],
    },
    {
      label: "Workspace",
      items: [
        { label: "Activity", href: `${base}/activity`, icon: Activity },
        { label: "Notifications", href: `${base}/notifications`, icon: Bell },
      ],
    },
    {
      label: "Account",
      items: [
        { label: "Usage", href: `${base}/usage`, icon: Gauge },
        { label: "Billing", href: `${base}/workspace-billing`, icon: CreditCard },
        { label: "Integrations", href: `${base}/settings/integrations`, icon: Puzzle },
        { label: "Settings", href: `${base}/settings`, icon: Settings },
        { label: "Admin", href: `${base}/admin`, icon: ShieldCheck },
      ],
    },
  ];

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname?.startsWith(`${item.href}/`);
  }

  return (
    <aside className="flex w-64 shrink-0 flex-col gap-6 overflow-y-auto border-r border-white/5 bg-[#0D1F38] p-5">
      <Link href={base} className="flex items-center gap-2.5 px-2 py-1">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#00E5FF] to-[#0090B0] text-sm font-black text-[#06131F]">
          G
        </span>
        <span className="text-lg font-bold tracking-tight text-white">GrantScout Pro</span>
      </Link>

      <nav className="flex flex-col gap-6 text-sm">
        {sections.map((section) => (
          <div key={section.label || "root"} className="flex flex-col gap-1">
            {section.label && (
              <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.label}
              </p>
            )}

            {section.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 transition-colors ${
                    active
                      ? "border-[#00E5FF] bg-white/[0.06] font-medium text-[#00E5FF]"
                      : "border-transparent text-slate-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon
                    size={17}
                    strokeWidth={2}
                    className={active ? "text-[#00E5FF]" : "text-slate-500 group-hover:text-slate-300"}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}

"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
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
  Handshake,
  Contact,
  ClipboardList,
  FormInput,
  type LucideIcon,
} from "lucide-react";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  { ssr: false }
);

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
      label: "CRM",
      items: [
        { label: "Pipeline", href: `${base}/crm`, icon: Handshake, exact: true },
        { label: "Contacts", href: `${base}/crm/contacts`, icon: Contact },
      ],
    },
    {
      label: "Team",
      items: [
        { label: "Tasks", href: `${base}/tasks`, icon: ClipboardList },
      ],
    },
    {
      label: "Forms",
      items: [
        { label: "Forms", href: `${base}/forms`, icon: FormInput, exact: true },
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
    <aside
      className="flex w-60 shrink-0 flex-col border-r border-white/[0.06] bg-[#0B1B33] p-4"
      style={{
        display: "flex",
        width: 240,
        flexShrink: 0,
        flexDirection: "column",
        padding: 16,
      }}
    >
      {/* "Home" link back to the workspace overview - the GrantScout Pro logo mark. */}
      <Link
        href={base}
        className="flex items-center gap-2 rounded-md px-1.5 py-1"
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px" }}
      >
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#00E5FF] to-[#0090B0] text-[13px] font-bold text-[#06131F]"
          style={{
            display: "flex",
            width: 24,
            height: 24,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 6,
            background: "linear-gradient(to bottom right, #00E5FF, #0090B0)",
            fontSize: 13,
            fontWeight: 700,
            color: "#06131F",
          }}
        >
          G
        </span>
        <span className="text-[14px] font-semibold tracking-tight text-white">GrantScout Pro</span>
      </Link>

      {/* Account row moved directly under the nav (instead of being pushed to the
          bottom of the viewport via flex-1) so it sits just below the last nav
          item instead of far down the page. */}
      <nav
        className="mt-5 flex flex-col gap-4 overflow-y-auto text-[13px]"
        style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}
      >
        {sections.map((section) => (
          <div key={section.label || "root"} className="flex flex-col gap-0.5">
            {section.label && (
              <p className="mb-1 px-2 text-[10.5px] font-medium uppercase tracking-wider text-slate-500/80">
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
                  className={`group flex items-center gap-2.5 rounded-md px-2 py-[7px] transition-colors ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
                  }`}
                >
                  <Icon
                    size={15}
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

      <div
        className="mt-4 flex items-center gap-2.5 border-t border-white/[0.06] px-1.5 pt-4"
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "16px 6px 0",
        }}
      >
        <UserButton afterSignOutUrl="/" />
        <span className="text-[13px] text-slate-300">Account</span>
      </div>
    </aside>
  );
}

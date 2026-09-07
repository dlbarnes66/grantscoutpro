"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceSettingsPage({ params }: { params: { workspaceId: string } }) {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const base = `/workspace/${workspaceId}`;

  const links = [
    {
      title: "Integrations",
      description: "Connect Slack, Stripe, and other tools with your own API keys.",
      href: `${base}/settings/integrations`,
    },
    {
      title: "Location Settings",
      description: "Manage this workspace's primary and additional locations.",
      href: `${base}/settings/location`,
    },
    {
      title: "Members & Admin",
      description: "Add teammates, change roles, and edit member profiles.",
      href: `${base}/admin`,
    },
    {
      title: "Billing",
      description: "View your plan, usage, and manage billing.",
      href: `${base}/workspace-billing`,
    },
  ];

  return (
    <WorkspaceShell title="Workspace Settings" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Workspace Settings" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full p-6 transition hover:border-[#00E5FF]">
              <h3 className="text-lg font-semibold text-white">{link.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </WorkspaceShell>
  );
}

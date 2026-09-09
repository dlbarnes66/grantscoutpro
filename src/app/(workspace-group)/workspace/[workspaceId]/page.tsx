import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  FileText,
  Landmark,
  Sparkles,
  Users,
  FilePlus2,
  Search,
  UserPlus,
  Puzzle,
} from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { getPlan } from "@/lib/plans";

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

const ACTIVITY_LABELS: Record<string, (m: any) => string> = {
  workspace_created: () => "Workspace created",
  member_added: (m) => `${m?.targetEmail || "A teammate"} was added to the workspace`,
  member_role_changed: (m) => `A member's role was changed to ${m?.role || "a new role"}`,
  member_removed: () => "A member was removed from the workspace",
  member_activated: () => "A member was reactivated",
  member_deactivated: () => "A member was deactivated",
  member_profile_updated: () => "A member's profile was updated",
  integration_saved: (m) => `${m?.providerName || "An integration"} was connected`,
  integration_save_failed: (m) => `${m?.providerName || "An integration"} key couldn't be verified`,
  integration_removed: (m) => `${m?.providerName || "An integration"} was disconnected`,
};

function describeActivity(action: string, metadata: any): string {
  const fn = ACTIVITY_LABELS[action];
  if (fn) {
    try {
      return fn(metadata);
    } catch {
      // fall through to generic label below
    }
  }
  return action.replace(/_/g, " ");
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default async function WorkspacePage({ params }: PageProps) {
  const { workspaceId } = await params;
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { members: true, billing: true },
  });

  if (!workspace) {
    return (
      <WorkspaceShell title="Workspace" workspaceId={workspaceId}>
        <Card className="p-8 text-center">
          <p className="text-slate-300">This workspace doesn't exist or has been removed.</p>
        </Card>
      </WorkspaceShell>
    );
  }

  const isMember =
    workspace.ownerId === userId || workspace.members.some((m) => m.userId === userId);

  if (!isMember) {
    return (
      <WorkspaceShell title="Workspace" workspaceId={workspaceId}>
        <Card className="p-8 text-center">
          <p className="text-slate-300">You don't have access to this workspace.</p>
        </Card>
      </WorkspaceShell>
    );
  }

  const [documentsCount, grantsCount, recentActivity] = await Promise.all([
    prisma.workspaceDocument.count({ where: { workspaceId } }),
    prisma.grant.count({ where: { workspaceId } }),
    prisma.workspaceActivity.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const activeMemberCount =
    workspace.members.filter((m) => m.status === "active").length + 1; // +1 for the owner
  const aiAnalysesCount = workspace.billing?.usageAI ?? 0;
  const plan = getPlan(workspace.billing?.plan);

  const stats = [
    { label: "Documents", value: documentsCount, icon: FileText, accent: "#00E5FF" },
    { label: "Grants", value: grantsCount, icon: Landmark, accent: "#34D399" },
    { label: "AI Analyses", value: aiAnalysesCount, icon: Sparkles, accent: "#A78BFA" },
    { label: "Team Members", value: activeMemberCount, icon: Users, accent: "#FBBF24" },
  ];

  const quickActions = [
    { label: "New Document", href: `/workspace/${workspaceId}/documents/new`, icon: FilePlus2 },
    { label: "Search Grants", href: `/workspace/${workspaceId}/search`, icon: Search },
    { label: "Invite Teammate", href: `/workspace/${workspaceId}/admin`, icon: UserPlus },
    { label: "Connect a Tool", href: `/workspace/${workspaceId}/settings/integrations`, icon: Puzzle },
  ];

  return (
    <WorkspaceShell title="Workspace Overview" workspaceId={workspaceId}>
      <p className="mb-6 text-[13px] text-slate-500">
        Manage grants, documents, collaboration, and AI-powered proposal development.
      </p>

      <div
        className="grid grid-cols-2 gap-2 mb-7 sm:grid-cols-4"
        style={{ display: "grid", gap: 8, marginBottom: 28 }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex w-full min-w-0 items-center gap-2 rounded-md border border-white/[0.07] bg-white/[0.02] px-3 py-2 text-[13px] font-medium text-slate-300 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05] hover:text-white"
            style={{
              display: "flex",
              width: "100%",
              minWidth: 0,
              alignItems: "center",
              gap: 8,
              borderRadius: 6,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              padding: "8px 12px",
            }}
          >
            <action.icon size={14} className="shrink-0 text-[#00E5FF]" />
            <span className="truncate">{action.label}</span>
          </Link>
        ))}
      </div>

      <div
        className="grid grid-cols-1 gap-3 mb-7 md:grid-cols-4"
        style={{ display: "grid", gap: 12, marginBottom: 28 }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.14]"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.02)",
              padding: 16,
            }}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: stat.accent, opacity: 0.6 }} />
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-slate-500">{stat.label}</p>
              <stat.icon size={14} style={{ color: stat.accent }} />
            </div>
            <p className="mt-2 text-[26px] font-semibold tabular-nums text-white">
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div
        className="grid grid-cols-1 gap-3 lg:grid-cols-3"
        style={{ display: "grid", gap: 12 }}
      >
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[13px] font-medium text-slate-300">Recent Activity</h2>
            <Link
              href={`/workspace/${workspaceId}/activity`}
              className="text-[12px] text-[#00E5FF] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-[13px] text-slate-500">
              Nothing here yet — activity across this workspace will show up as your team works.
            </p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[13px] text-slate-300">
                      {describeActivity(entry.action, entry.metadata)}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-slate-500">
                      {entry.user?.name || entry.user?.email || "System"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11.5px] text-slate-500">{timeAgo(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-[13px] font-medium text-slate-300">{workspace.name}</h2>
          <dl className="divide-y divide-white/[0.06] text-[13px]">
            <div className="flex items-center justify-between py-2 first:pt-0">
              <dt className="text-slate-500">Plan</dt>
              <dd className="font-medium text-white">{plan.name}</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500">Seats</dt>
              <dd className="font-medium text-white">
                {plan.maxSeats === null
                  ? `${workspace.currentSeats} used`
                  : `${workspace.currentSeats} / ${plan.maxSeats} used`}
              </dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium capitalize text-white">{workspace.billingStatus}</dd>
            </div>
            <div className="flex items-center justify-between py-2 last:pb-0">
              <dt className="text-slate-500">Created</dt>
              <dd className="font-medium text-white">
                {workspace.createdAt.toLocaleDateString()}
              </dd>
            </div>
          </dl>

          <Link
            href={`/workspace/${workspaceId}/workspace-billing`}
            className="mt-4 block rounded-md border border-white/[0.07] py-2 text-center text-[12.5px] font-medium text-slate-300 transition-colors hover:border-white/[0.14] hover:text-white"
          >
            Manage Billing
          </Link>
        </Card>
      </div>
    </WorkspaceShell>
  );
}

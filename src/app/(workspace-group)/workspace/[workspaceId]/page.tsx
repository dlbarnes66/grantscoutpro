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
    <WorkspaceShell
      title="Workspace Overview"
      subtitle="Manage grants, documents, collaboration, and AI-powered proposal development."
      workspaceId={workspaceId}
    >
      <div className="flex flex-wrap gap-3 mb-8">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-[#00E5FF]/40 hover:bg-white/[0.06] hover:text-white"
          >
            <action.icon size={16} className="text-[#00E5FF]" />
            {action.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-transform hover:-translate-y-0.5"
          >
            <div
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ background: stat.accent }}
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <stat.icon size={18} style={{ color: stat.accent }} />
            </div>
            <p className="mt-3 text-4xl font-bold text-white">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link
              href={`/workspace/${workspaceId}/activity`}
              className="text-sm text-[#00E5FF] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-400">
              Nothing here yet — activity across this workspace will show up as your team works.
            </p>
          ) : (
            <ul className="space-y-4">
              {recentActivity.map((entry) => (
                <li key={entry.id} className="flex items-start justify-between gap-4 text-sm">
                  <div>
                    <p className="text-slate-200">{describeActivity(entry.action, entry.metadata)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {entry.user?.name || entry.user?.email || "System"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{timeAgo(entry.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{workspace.name}</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Plan</dt>
              <dd className="font-medium text-white">{plan.name}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Seats</dt>
              <dd className="font-medium text-white">
                {plan.maxSeats === null
                  ? `${workspace.currentSeats} used`
                  : `${workspace.currentSeats} / ${plan.maxSeats} used`}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Status</dt>
              <dd className="font-medium capitalize text-white">{workspace.billingStatus}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-400">Created</dt>
              <dd className="font-medium text-white">
                {workspace.createdAt.toLocaleDateString()}
              </dd>
            </div>
          </dl>

          <Link
            href={`/workspace/${workspaceId}/workspace-billing`}
            className="mt-5 block text-center text-sm font-medium text-[#00E5FF] hover:underline"
          >
            Manage Billing
          </Link>
        </Card>
      </div>
    </WorkspaceShell>
  );
}

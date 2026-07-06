import { prisma } from "@/lib/prisma";
import { PLAN_CAPABILITIES } from "@/lib/planCapabilities";

export const dynamic = "force-dynamic";

function AutomationPanel({ workspace }: { workspace: any }) {
  const plan = workspace.subscriptionPlan as keyof typeof PLAN_CAPABILITIES;
  const caps = PLAN_CAPABILITIES[plan];

  if (!caps.aiAutomation) {
    return (
      <div className="p-4 border rounded-md bg-yellow-50">
        <p className="text-sm text-yellow-700">
          AI automation is available on Advanced and Enterprise plans.
        </p>
        <a
          href={`/dashboard/workspace/${workspace.id}/billing`}
          className="mt-2 inline-block text-blue-600 text-sm"
        >
          Upgrade to unlock
        </a>
      </div>
    );
  }

  return <div>{/* full automation UI here */}</div>;
}

export default async function AutomationPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: params.workspaceId },
  });

  if (!workspace) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Workspace not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Automation</h1>
      <AutomationPanel workspace={workspace} />
    </div>
  );
}

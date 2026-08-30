"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import Card from "@/components/ui/Card";

export default function WorkspaceActivityPage({ params }) {
  const workspaceId = params.workspaceId;

  return (
    <WorkspaceShell title="Workspace Activity" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: `/workspace/${workspaceId}` },
          { label: "Activity" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Recent workspace activity will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

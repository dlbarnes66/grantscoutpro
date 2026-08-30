"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import WorkspaceLocationSettings from "@/components/workspace/WorkspaceLocationSettings";
import WorkspaceMultiLocationSettings from "@/components/workspace/WorkspaceMultiLocationSettings";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceLocationPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  return (
    <WorkspaceShell title="Location Settings" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Workspace" },
          { label: "Location Settings" },
        ]}
      />

      <div className="space-y-8">
        <WorkspaceLocationSettings workspaceId={workspaceId} />
        <WorkspaceMultiLocationSettings workspaceId={workspaceId} />
      </div>
    </WorkspaceShell>
  );
}

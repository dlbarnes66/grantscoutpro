"use client";

import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceNotificationsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  return (
    <WorkspaceShell title="Workspace Notifications" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Notifications" },
        ]}
      />

      <Card className="p-6">
        <p className="text-slate-300">Workspace notifications will appear here.</p>
      </Card>
    </WorkspaceShell>
  );
}

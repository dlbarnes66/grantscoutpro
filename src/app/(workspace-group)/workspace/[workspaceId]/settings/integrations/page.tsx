"use client";

import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import IntegrationsSection from "@/components/workspace/settings/IntegrationsSection";

export default function WorkspaceIntegrationsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  return (
    <WorkspaceShell title="Integrations" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Settings", href: `/workspace/${workspaceId}/settings` },
          { label: "Integrations" },
        ]}
      />

      <IntegrationsSection workspaceId={workspaceId} />
    </WorkspaceShell>
  );
}

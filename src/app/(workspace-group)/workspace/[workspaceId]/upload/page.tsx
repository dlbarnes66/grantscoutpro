"use client";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceUploadPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  return (
    <WorkspaceShell title="Upload Documents" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Upload" },
        ]}
      />

      <Card className="p-6">
        <p className="text-slate-300">Upload interface will appear here.</p>
      </Card>
    </WorkspaceShell>
  );
}

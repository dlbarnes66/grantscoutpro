"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceSettingsPage() {
  return (
    <WorkspaceShell title="Workspace Settings">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace Settings" },
        ]}
      />

      <Card className="p-6">
        <p className="text-slate-300">Workspace settings will appear here.</p>
      </Card>
    </WorkspaceShell>
  );
}

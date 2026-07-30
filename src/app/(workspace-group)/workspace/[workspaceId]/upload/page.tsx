"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceUploadPage() {
  return (
    <WorkspaceShell title="Upload Documents">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Upload" },
        ]}
      />

      <Card className="p-6">
        <p className="text-slate-300">Upload interface will appear here.</p>
      </Card>
    </WorkspaceShell>
  );
}

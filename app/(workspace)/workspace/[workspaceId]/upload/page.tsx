import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspaceUploadPage() {
  return (
    <WorkspaceShell title="Upload Documents">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: "../" },
          { label: "Upload" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Document upload tools will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

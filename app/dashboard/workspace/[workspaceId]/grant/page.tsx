import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspaceGrantsPage() {
  return (
    <WorkspaceShell title="Workspace Grants">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: "../" },
          { label: "Grants" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Workspace grant listings will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

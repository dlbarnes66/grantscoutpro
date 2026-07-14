import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspaceActivityPage() {
  return (
    <WorkspaceShell title="Workspace Activity">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: "../" },
          { label: "Activity" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Activity logs and workspace events will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspaceNotificationsPage() {
  return (
    <WorkspaceShell title="Workspace Notifications">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: "../" },
          { label: "Notifications" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Workspace notifications will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

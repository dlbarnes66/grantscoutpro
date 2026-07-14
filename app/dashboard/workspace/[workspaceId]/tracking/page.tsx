import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspaceTrackingPage() {
  return (
    <WorkspaceShell title="Grant Tracking">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: "../" },
          { label: "Tracking" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Grant tracking tools will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

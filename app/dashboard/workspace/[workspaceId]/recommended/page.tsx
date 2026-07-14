import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspaceRecommendedPage() {
  return (
    <WorkspaceShell title="Recommended Grants">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: "../" },
          { label: "Recommended" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Recommended grants will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

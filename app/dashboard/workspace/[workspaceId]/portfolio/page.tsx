import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspacePortfolioPage() {
  return (
    <WorkspaceShell title="Portfolio Intelligence">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace", href: "../" },
          { label: "Portfolio" },
        ]}
      />

      <Card>
        <p className="text-slate-300">
          Portfolio intelligence will appear here.
        </p>
      </Card>
    </WorkspaceShell>
  );
}

import { WorkspaceShell } from "@/components/workspace/WorkspaceShell";
import { Tabs } from "@/components/ui/Tabs";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function WorkspaceOverviewPage() {
  return (
    <WorkspaceShell title="Workspace Overview">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Workspace" },
        ]}
      />

      <Tabs
        tabs={[
          {
            label: "Activity",
            content: (
              <Card>
                <p className="text-slate-300">
                  Recent workspace activity will appear here.
                </p>
              </Card>
            ),
          },
          {
            label: "Grants",
            content: (
              <Card>
                <p className="text-slate-300">
                  Workspace grants overview will appear here.
                </p>
              </Card>
            ),
          },
          {
            label: "Analytics",
            content: (
              <Card>
                <p className="text-slate-300">
                  Workspace analytics will appear here.
                </p>
              </Card>
            ),
          },
        ]}
      />
    </WorkspaceShell>
  );
}

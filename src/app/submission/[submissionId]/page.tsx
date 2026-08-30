"use client";

import { useState } from "react";

import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Tabs from "@/components/ui/Tabs";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function WorkspaceOverviewPage({
  params,
}: {
  params: {
    submissionId: string;
  };
}) {
  const [currentTab, setCurrentTab] = useState("activity");

  const tabs = [
    {
      id: "activity",
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
      id: "grants",
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
      id: "analytics",
      label: "Analytics",
      content: (
        <Card>
          <p className="text-slate-300">
            Workspace analytics will appear here.
          </p>
        </Card>
      ),
    },
  ];

  return (
    <WorkspaceShell
      title="Workspace Overview"
      workspaceId={params.submissionId}
    >
      <Breadcrumbs
        items={[
          {
            label: "Dashboard",
            href: "/dashboard",
          },
          {
            label: "Workspace",
          },
        ]}
      />

      <Tabs
        tabs={tabs}
        current={currentTab}
        onSelectAction={setCurrentTab}
      />
    </WorkspaceShell>
  );
}
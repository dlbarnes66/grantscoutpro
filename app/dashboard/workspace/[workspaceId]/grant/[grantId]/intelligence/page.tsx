"use client";

import GrantIntelligence from "./GrantIntelligence";

export default function IntelligencePage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Intelligence Report</h1>
      <GrantIntelligence workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

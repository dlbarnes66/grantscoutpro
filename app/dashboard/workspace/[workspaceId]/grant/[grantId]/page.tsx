"use client";

import GrantIntelligence from "./GrantIntelligence";

export default function GrantPage({
  params,
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Grant Intelligence</h1>

      <GrantIntelligence workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

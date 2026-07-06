"use client";

import GrantTimeline from "./GrantTimeline";

export default function TimelinePage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Timeline</h1>
      <GrantTimeline workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

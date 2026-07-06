"use client";

import GrantCompare from "./GrantCompare";

export default function GrantComparePage({
  params
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Comparison</h1>
      <GrantCompare workspaceId={workspaceId} />
    </div>
  );
}

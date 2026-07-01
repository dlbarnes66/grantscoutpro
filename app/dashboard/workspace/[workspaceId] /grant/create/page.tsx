"use client";

import GrantCreateForm from "./GrantCreateForm";

export default function GrantCreatePage({
  params
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Create New Grant</h1>
      <GrantCreateForm workspaceId={workspaceId} />
    </div>
  );
}

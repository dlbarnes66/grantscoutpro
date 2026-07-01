"use client";

import AdminConsole from "./AdminConsole";

export default function AdminPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Admin Console</h1>
      <AdminConsole workspaceId={workspaceId} />
    </div>
  );
}

"use client";

import WorkspaceNotifications from "./WorkspaceNotifications";

export default function WorkspaceNotificationsPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Workspace Notifications</h1>
      <WorkspaceNotifications workspaceId={workspaceId} />
    </div>
  );
}

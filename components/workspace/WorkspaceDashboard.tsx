"use client";

import WorkspaceACLHide from "@/components/workspace/WorkspaceACLHide";
import DocumentList from "@/components/documents/DocumentList";

export default function WorkspaceDashboard({ workspaceId }) {
  return (
    <div className="space-y-6 p-4">

      {/* Documents (everyone with canViewDocument sees only their allowed docs) */}
      <div>
        <h2 className="text-xl font-bold mb-2">Documents</h2>
        <DocumentList workspaceId={workspaceId} />
      </div>

      {/* Admin-only: Member Management */}
      <WorkspaceACLHide workspaceId={workspaceId} requireAdmin={true}>
        <div>
          <h2 className="text-xl font-bold mb-2">Members</h2>
          <a
            href={`/workspace/${workspaceId}/members`}
            className="block p-3 border rounded hover:bg-gray-50"
          >
            Manage Workspace Members
          </a>
        </div>
      </WorkspaceACLHide>

      {/* Owner-only: Workspace Settings */}
      <WorkspaceACLHide workspaceId={workspaceId} requireOwner={true}>
        <div>
          <h2 className="text-xl font-bold mb-2">Workspace Settings</h2>
          <a
            href={`/workspace/${workspaceId}/settings`}
            className="block p-3 border rounded hover:bg-gray-50"
          >
            Workspace Settings
          </a>
        </div>
      </WorkspaceACLHide>

      {/* Admin-only: Billing */}
      <WorkspaceACLHide workspaceId={workspaceId} requireAdmin={true}>
        <div>
          <h2 className="text-xl font-bold mb-2">Billing</h2>
          <a
            href={`/workspace/${workspaceId}/billing`}
            className="block p-3 border rounded hover:bg-gray-50"
          >
            Billing & Subscription
          </a>
        </div>
      </WorkspaceACLHide>

    </div>
  );
}

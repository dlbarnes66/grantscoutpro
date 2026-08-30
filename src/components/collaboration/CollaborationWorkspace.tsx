"use client";

import CollaborationPresence from "./CollaborationPresence";
import CollaborationChat from "./CollaborationChat";
import CollaborationEditor from "./CollaborationEditor";

type Props = {
  workspaceId: string;
  userId: string;
};

export default function CollaborationWorkspace({ workspaceId, userId }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      <div className="lg:col-span-3 flex flex-col gap-4">
        <CollaborationEditor workspaceId={workspaceId} userId={userId} />
      </div>

      <div className="lg:col-span-1 flex flex-col gap-4">
        <CollaborationPresence workspaceId={workspaceId} userId={userId} />
        <CollaborationChat workspaceId={workspaceId} userId={userId} />
      </div>
    </div>
  );
}

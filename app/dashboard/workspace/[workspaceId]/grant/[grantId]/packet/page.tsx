"use client";

import GrantPacket from "./GrantPacket";

export default function GrantPacketPage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Submission Packet</h1>
      <GrantPacket workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

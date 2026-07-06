"use client";

import GrantPacketPDF from "./GrantPacketPDF";

export default function GrantPacketPDFPage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const workspaceId = params.workspaceId;
  const grantId = params.grantId;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Export Submission Packet as PDF</h1>
      <GrantPacketPDF workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

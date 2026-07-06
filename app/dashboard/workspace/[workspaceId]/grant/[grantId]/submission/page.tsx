"use client";

import SubmissionChecklist from "./SubmissionChecklist";

export default function SubmissionPage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Submission</h1>
      <SubmissionChecklist workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

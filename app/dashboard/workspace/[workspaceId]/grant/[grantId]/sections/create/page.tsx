"use client";

import SectionCreateForm from "./SectionCreateForm";

export default function SectionCreatePage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Create New Section</h1>
      <SectionCreateForm workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

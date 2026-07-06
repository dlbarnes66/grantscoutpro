"use client";

import SectionRewrite from "./SectionRewrite";

export default function SectionRewritePage({
  params
}: {
  params: { workspaceId: string; grantId: string; sectionId: string };
}) {
  const { workspaceId, grantId, sectionId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">AI Rewrite Engine</h1>
      <SectionRewrite
        workspaceId={workspaceId}
        grantId={grantId}
        sectionId={sectionId}
      />
    </div>
  );
}

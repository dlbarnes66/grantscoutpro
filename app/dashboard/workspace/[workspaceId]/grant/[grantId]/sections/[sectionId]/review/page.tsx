"use client";

import SectionReview from "./SectionReview";

export default function SectionReviewPage({
  params
}: {
  params: { workspaceId: string; grantId: string; sectionId: string };
}) {
  const { workspaceId, grantId, sectionId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">AI Section Review</h1>
      <SectionReview
        workspaceId={workspaceId}
        grantId={grantId}
        sectionId={sectionId}
      />
    </div>
  );
}

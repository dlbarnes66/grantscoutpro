"use client";

import PortfolioIntelligence from "./PortfolioIntelligence";

export default function PortfolioPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Portfolio Intelligence</h1>
      <PortfolioIntelligence workspaceId={workspaceId} />
    </div>
  );
}

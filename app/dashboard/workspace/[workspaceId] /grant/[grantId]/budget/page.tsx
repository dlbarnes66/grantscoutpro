"use client";

import BudgetBuilder from "./BudgetBuilder";

export default function BudgetPage({
  params
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Grant Budget</h1>
      <BudgetBuilder workspaceId={workspaceId} grantId={grantId} />
    </div>
  );
}

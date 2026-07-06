"use client";

import BillingConsole from "./BillingConsole";

export default function BillingPage({ params }: { params: { workspaceId: string } }) {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Billing & Subscription</h1>
      <BillingConsole workspaceId={params.workspaceId} />
    </div>
  );
}

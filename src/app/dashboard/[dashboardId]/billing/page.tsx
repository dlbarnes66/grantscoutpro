"use client";

import { useEffect, useState } from "react";
import { BillingPanel } from "./components/BillingPanel";

export default function BillingPage({ params }: any) {
  const { workspaceId } = params;
  const [billing, setBilling] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/billing/update?workspaceId=${workspaceId}`);
      const data = await res.json();
      setBilling(data);
    }
    load();
  }, [workspaceId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Billing & Subscription</h1>
      <BillingPanel billing={billing} workspaceId={workspaceId} />
    </div>
  );
}

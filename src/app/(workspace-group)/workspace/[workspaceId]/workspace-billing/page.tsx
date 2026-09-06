"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function BillingPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/billing`);
      const json = await res.json();
      setBilling(json.billing);
      setLoading(false);
    };

    load();
  }, [workspaceId]);

  return (
    <WorkspaceShell title="Billing" workspaceId={workspaceId}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Billing</h1>

        {loading && <p>Loading...</p>}

        {billing && (
          <div className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
            <p className="text-xl font-semibold">Plan: {billing.plan}</p>

            <p className="text-sm text-gray-700">
              Stripe Customer ID: {billing.stripeCustomerId || "None"}
            </p>

            <p className="text-sm text-gray-700">
              Stripe Subscription ID: {billing.stripeSubscriptionId || "None"}
            </p>

            <p className="text-sm text-gray-700">
              Billing Period Start: {new Date(billing.periodStart).toLocaleString()}
            </p>

            {billing.periodEnd && (
              <p className="text-sm text-gray-700">
                Billing Period End: {new Date(billing.periodEnd).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

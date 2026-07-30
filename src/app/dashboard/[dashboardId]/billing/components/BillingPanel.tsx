"use client";

import { useState } from "react";

export function BillingPanel({ billing, workspaceId }: any) {
  const [loading, setLoading] = useState(false);

  async function createCustomer() {
    setLoading(true);
    const res = await fetch(`/api/billing/create-customer`, {
      method: "POST",
      body: JSON.stringify({ workspaceId }),
    });
    const data = await res.json();
    setLoading(false);
    alert("Customer created!");
    location.reload();
  }

  async function openPortal() {
    const res = await fetch(`/api/billing/portal`, {
      method: "POST",
      body: JSON.stringify({ workspaceId }),
    });
    const data = await res.json();
    window.location.href = data.url;
  }

  async function checkout(plan: string) {
    const res = await fetch(`/api/billing/checkout`, {
      method: "POST",
      body: JSON.stringify({ workspaceId, plan }),
    });
    const data = await res.json();
    window.location.href = data.url;
  }

  if (!billing) {
    return (
      <button
        onClick={createCustomer}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Creating..." : "Create Billing Profile"}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Current Plan</h3>
        <p>{billing.workspace.subscriptionTier}</p>
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Billing Status</h3>
        <p>{billing.workspace.billingStatus}</p>
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Billing Period</h3>
        <p>{billing.workspace.billingPeriod}</p>
      </div>

      <div className="border rounded p-4">
        <h3 className="font-semibold mb-2">Renewal Date</h3>
        <p>
          {billing.workspace.billingRenewalDate
            ? new Date(billing.workspace.billingRenewalDate).toLocaleDateString()
            : "—"}
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => checkout("team")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Upgrade to Team
        </button>

        <button
          onClick={() => checkout("pro")}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Upgrade to Pro
        </button>

        <button
          onClick={openPortal}
          className="px-4 py-2 bg-gray-800 text-white rounded"
        >
          Open Billing Portal
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";

export default function BillingConsole({ workspaceId }: { workspaceId: string }) {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);

    const res = await fetch("/api/billing/portal", {
      method: "POST",
      body: JSON.stringify({ workspaceId })
    });

    const json = await res.json();
    setLoading(false);

    if (json.url) {
      window.location.href = json.url;
    } else {
      alert("Failed to open billing portal.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Billing & Subscription</h1>

      <p className="text-gray-700">
        Manage your subscription, payment methods, invoices, and more.
      </p>

      <button
        onClick={openPortal}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Opening..." : "Open Billing Portal"}
      </button>
    </div>
  );
}

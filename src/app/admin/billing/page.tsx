"use client"
import { auth } from "@clerk/nextjs/server";

import { useEffect, useState } from "react";

export default function AdminBillingPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/billing/workspaces");
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      } catch (err) {
        console.error("Failed to load billing data:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Admin Billing Dashboard</h1>
        <p>Loading workspaces…</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Billing Dashboard</h1>

      <table className="min-w-full border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Workspace</th>
            <th className="border p-2">Tier</th>
            <th className="border p-2">Seats</th>
            <th className="border p-2">Add-ons</th>
            <th className="border p-2">Billing Status</th>
            <th className="border p-2">Renewal</th>
            <th className="border p-2">Usage</th>
            <th className="border p-2">Stripe</th>
            <th className="border p-2">Logs</th>
          </tr>
        </thead>

        <tbody>
          {workspaces.map((ws) => (
            <tr key={ws.id}>
              <td className="border p-2">{ws.name}</td>

              <td className="border p-2 capitalize">{ws.subscriptionTier}</td>

              <td className="border p-2">
                {ws.currentSeats} / {ws.maxSeats}
              </td>

              <td className="border p-2">
                {ws.addons.length === 0
                  ? "None"
                  : ws.addons.map((a: any) => a.addonType).join(", ")}
              </td>

              <td className="border p-2 capitalize">{ws.billingStatus}</td>

              <td className="border p-2">
                {ws.billingRenewalDate
                  ? new Date(ws.billingRenewalDate).toLocaleDateString()
                  : "—"}
              </td>

              <td className="border p-2">
                <div>Searches: {ws.billing?.usageSearches ?? 0}</div>
                <div>Uploads: {ws.billing?.usageUploads ?? 0}</div>
                <div>AI: {ws.billing?.usageAI ?? 0}</div>
                <div>Members: {ws.billing?.usageMembers ?? 0}</div>
              </td>

              <td className="border p-2 space-y-1">
                {ws.billing?.stripeCustomerId && (
                  <a
                    href={`https://dashboard.stripe.com/customers/${ws.billing.stripeCustomerId}`}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    Customer
                  </a>
                )}

                {ws.billing?.stripeSubscriptionId && (
                  <a
                    href={`https://dashboard.stripe.com/subscriptions/${ws.billing.stripeSubscriptionId}`}
                    target="_blank"
                    className="text-blue-600 underline block"
                  >
                    Subscription
                  </a>
                )}
              </td>

              <td className="border p-2">
                <a
                  href={`/admin/billing/logs?workspaceId=${ws.id}`}
                  className="text-blue-600 underline"
                >
                  View Logs
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

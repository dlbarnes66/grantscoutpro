"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

const SELF_SERVE_PLANS = [
  { id: "basic", name: "Basic", monthlyPrice: 29 },
  { id: "team", name: "Team", monthlyPrice: 49 },
  { id: "business", name: "Business", monthlyPrice: 99 },
];

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Past due",
  canceled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
};

export default function BillingPage() {
  const routeParams = useParams();
  const searchParams = useSearchParams();
  const workspaceId = routeParams.workspaceId as string;
  const checkoutFlag = searchParams.get("checkout");

  const [billing, setBilling] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/billing`);
      const json = await res.json();
      setBilling(json.billing);
      setIsOwner(!!json.isOwner);
    } catch (err) {
      console.error("Failed to load billing:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [workspaceId]);

  async function subscribe(planId: string) {
    setActionLoading(planId);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/billing/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: "monthly" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setActionLoading(null);
    }
  }

  async function manageBilling() {
    setActionLoading("manage");
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/billing/portal`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open billing portal");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message);
      setActionLoading(null);
    }
  }

  const hasActiveSubscription = !!billing?.stripeSubscriptionId;
  const status = billing?.status ?? "active";
  const needsAttention = status === "past_due" || status === "unpaid" || status === "incomplete";

  return (
    <WorkspaceShell title="Billing" workspaceId={workspaceId}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Billing</h1>

        {checkoutFlag === "success" && (
          <div className="border border-green-300 bg-green-50 text-green-800 rounded-lg p-4 text-sm">
            Payment received — it can take a few seconds for your plan to update below.
          </div>
        )}
        {checkoutFlag === "canceled" && (
          <div className="border border-gray-300 bg-gray-50 text-gray-700 rounded-lg p-4 text-sm">
            Checkout was canceled — no charge was made.
          </div>
        )}

        {loading && <p>Loading...</p>}

        {!loading && needsAttention && (
          <div className="border border-red-300 bg-red-50 text-red-800 rounded-lg p-4 text-sm font-medium">
            {status === "past_due" && "Your last payment failed. Please update your payment method to avoid losing access."}
            {status === "unpaid" && "This workspace's subscription is unpaid. Please update your payment method."}
            {status === "incomplete" && "Your subscription setup is incomplete. Please finish payment setup."}
          </div>
        )}

        {!loading && status === "canceled" && (
          <div className="border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg p-4 text-sm font-medium">
            This workspace's subscription has been canceled.
          </div>
        )}

        {!loading && billing?.cancelAtPeriodEnd && status === "active" && (
          <div className="border border-yellow-300 bg-yellow-50 text-yellow-800 rounded-lg p-4 text-sm">
            Your plan is set to cancel at the end of the current billing period.
          </div>
        )}

        {error && (
          <div className="border border-red-300 bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>
        )}

        {billing && (
          <div className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold capitalize">Plan: {billing.plan}</p>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>

            <p className="text-sm text-gray-700">Seats: {billing.seats}</p>

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

            {isOwner && hasActiveSubscription && (
              <button
                onClick={manageBilling}
                disabled={actionLoading === "manage"}
                className="mt-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm disabled:opacity-50"
              >
                {actionLoading === "manage" ? "Opening..." : "Manage Billing (change plan, update card, cancel)"}
              </button>
            )}
          </div>
        )}

        {isOwner && !hasActiveSubscription && !loading && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Choose a plan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {SELF_SERVE_PLANS.map((plan) => (
                <div key={plan.id} className="border rounded-lg p-4 bg-white shadow-sm space-y-2">
                  <p className="text-lg font-semibold">{plan.name}</p>
                  <p className="text-2xl font-bold">
                    ${plan.monthlyPrice}
                    <span className="text-sm font-normal text-gray-500">/mo</span>
                  </p>
                  <button
                    onClick={() => subscribe(plan.id)}
                    disabled={actionLoading === plan.id}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                  >
                    {actionLoading === plan.id ? "Redirecting..." : `Subscribe to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Need Enterprise? That plan is custom-priced — contact us to set it up.
            </p>
          </div>
        )}

        {!isOwner && !loading && (
          <p className="text-sm text-gray-500">Only the workspace owner can manage billing.</p>
        )}
      </div>
    </WorkspaceShell>
  );
}

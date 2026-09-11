"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { ANNUAL_DISCOUNT_PERCENT, getAnnualMonthlyEquivalent, getWorkspaceLimitLabel, type PlanConfig } from "@/lib/plans";

const SELF_SERVE_PLANS = [
  { id: "basic", name: "Basic", monthlyPrice: 29, workspaces: 1 },
  { id: "team", name: "Team", monthlyPrice: 49, workspaces: 3 },
  { id: "business", name: "Business", monthlyPrice: 99, workspaces: 6 },
];

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Past due",
  canceled: "Canceled",
  unpaid: "Unpaid",
  incomplete: "Incomplete",
};

interface OrgBillingResponse {
  org: {
    id: string;
    name: string;
    tier: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    billingStatus: string | null;
    cancelAtPeriodEnd: boolean;
    periodEnd: string | null;
  };
  plan: PlanConfig;
  workspacesUsed: number;
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const checkoutFlag = searchParams.get("checkout");

  const [data, setData] = useState<OrgBillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");

  async function load() {
    try {
      const res = await fetch("/api/org/billing");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load billing");
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load billing");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function subscribe(planId: string) {
    setActionLoading(planId);
    setError(null);
    try {
      const res = await fetch("/api/org/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, interval: billingInterval }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      window.location.href = json.url;
    } catch (err: any) {
      setError(err.message);
      setActionLoading(null);
    }
  }

  async function manageBilling() {
    setActionLoading("manage");
    setError(null);
    try {
      const res = await fetch("/api/org/billing/portal", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not open billing portal");
      window.location.href = json.url;
    } catch (err: any) {
      setError(err.message);
      setActionLoading(null);
    }
  }

  const org = data?.org;
  const plan = data?.plan;
  const hasActiveSubscription = !!org?.stripeSubscriptionId;
  const status = org?.billingStatus ?? "active";
  const needsAttention = status === "past_due" || status === "unpaid" || status === "incomplete";

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Billing</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Your plan applies to your whole account and every workspace you create.
          </p>
        </div>

        {checkoutFlag === "success" && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-400/[0.08] p-4 text-[13px] text-emerald-300">
            <CheckCircle2 size={16} />
            Payment received — it can take a few seconds for your plan to update below.
          </div>
        )}
        {checkoutFlag === "canceled" && (
          <div className="rounded-lg border border-white/[0.1] bg-white/[0.03] p-4 text-[13px] text-slate-300">
            Checkout was canceled — no charge was made.
          </div>
        )}

        {loading && <div className="text-slate-400">Loading…</div>}

        {!loading && needsAttention && (
          <div className="rounded-lg border border-red-400/30 bg-red-400/[0.08] p-4 text-[13px] font-medium text-red-300">
            {status === "past_due" && "Your last payment failed. Please update your payment method to avoid losing access."}
            {status === "unpaid" && "Your subscription is unpaid. Please update your payment method."}
            {status === "incomplete" && "Your subscription setup is incomplete. Please finish payment setup."}
          </div>
        )}

        {!loading && org?.cancelAtPeriodEnd && status === "active" && (
          <div className="rounded-lg border border-amber-400/30 bg-amber-400/[0.08] p-4 text-[13px] text-amber-300">
            Your plan is set to cancel at the end of the current billing period.
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-400/30 bg-red-400/[0.08] p-3 text-[13px] text-red-300">
            {error}
          </div>
        )}

        {!loading && org && plan && (
          <div className="rounded-lg border border-white/[0.08] bg-[#11233F] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xl font-semibold text-white">{plan.name} plan</p>
              <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-slate-300">
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>

            <p className="text-[13px] text-slate-300">
              {getWorkspaceLimitLabel(plan)} &middot; {data.workspacesUsed} of {plan.maxWorkspaces} used
            </p>

            {org.periodEnd && (
              <p className="text-[13px] text-slate-400">
                Renews {new Date(org.periodEnd).toLocaleDateString()}
              </p>
            )}

            {hasActiveSubscription && (
              <button
                onClick={manageBilling}
                disabled={actionLoading === "manage"}
                className="mt-2 flex items-center gap-2 rounded-md bg-white/[0.06] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-white/[0.1] disabled:opacity-50"
              >
                {actionLoading === "manage" && <Loader2 size={14} className="animate-spin" />}
                {actionLoading === "manage" ? "Opening…" : "Manage Billing (change plan, update card, cancel)"}
              </button>
            )}
          </div>
        )}

        {!loading && !hasActiveSubscription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-white">Choose a plan</h2>
              <div className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.03] p-1 text-[13px]">
                <button
                  type="button"
                  onClick={() => setBillingInterval("monthly")}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    billingInterval === "monthly" ? "bg-white/[0.1] font-medium text-white" : "text-slate-400"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval("yearly")}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    billingInterval === "yearly" ? "bg-white/[0.1] font-medium text-white" : "text-slate-400"
                  }`}
                >
                  Annual <span className="text-emerald-400">Save {ANNUAL_DISCOUNT_PERCENT}%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {SELF_SERVE_PLANS.map((p) => (
                <div key={p.id} className="rounded-lg border border-white/[0.08] bg-[#11233F] p-4 space-y-2">
                  <p className="text-[15px] font-semibold text-white">{p.name}</p>
                  <p className="text-2xl font-bold text-white">
                    ${billingInterval === "yearly" ? getAnnualMonthlyEquivalent(p.monthlyPrice) : p.monthlyPrice}
                    <span className="text-[13px] font-normal text-slate-400">/mo</span>
                  </p>
                  {billingInterval === "yearly" && (
                    <p className="text-[12px] text-slate-500">
                      Billed annually (${getAnnualMonthlyEquivalent(p.monthlyPrice) * 12}/yr)
                    </p>
                  )}
                  <p className="text-[12px] text-slate-400">
                    Up to {p.workspaces} workspace{p.workspaces === 1 ? "" : "s"}
                  </p>
                  <button
                    onClick={() => subscribe(p.id)}
                    disabled={actionLoading === p.id}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-semibold text-[#06131F] transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {actionLoading === p.id && <Loader2 size={14} className="animate-spin" />}
                    {actionLoading === p.id ? "Redirecting…" : `Subscribe to ${p.name}`}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[12px] text-slate-500">
              Need Enterprise (up to 100 workspaces)? That plan is custom-priced — contact us to set it up.
            </p>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

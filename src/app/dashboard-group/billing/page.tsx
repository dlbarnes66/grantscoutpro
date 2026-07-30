"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";

export default function BillingPage() {
  const [billing, setBilling] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/billing/overview", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const json = await res.json();
      setBilling(json);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading billing…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Billing & Subscription</h1>

      <div className="border rounded p-4">
        <h2 className="font-semibold">Current Plan</h2>
        <p className="text-lg">{billing.plan}</p>
        <p className="text-sm text-gray-600">
          Renews: {new Date(billing.renewsAt).toLocaleDateString()}
        </p>
      </div>

      <a
        href="/billing/upgrade"
        className="block bg-blue-600 text-white px-4 py-2 rounded w-fit"
      >
        Upgrade Plan
      </a>

      <a
        href="/billing/history"
        className="block bg-gray-200 text-black px-4 py-2 rounded w-fit"
      >
        View Billing History
      </a>
    </div>
  );
}

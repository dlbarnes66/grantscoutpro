"use client";

import { useEffect, useState } from "react";

export default function BillingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/billing-endpoint/overview");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load billing overview:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Billing</h1>
        <p>Loading billing information…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Billing</h1>
        <p>Unable to load billing information.</p>
      </div>
    );
  }

  const {
    workspace,
    billing,
    addons,
    seats,
    stripePortalUrl,
    seatCheckoutMonthlyUrl,
    seatCheckoutYearlyUrl,
    addonCheckoutUrls,
  } = data;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Billing Settings</h1>

      {/* PLAN */}
      <section className="border p-4 rounded">
        <h2 className="text-lg font-semibold">Subscription Plan</h2>
        <p className="mt-2 capitalize">
          <strong>Plan:</strong> {workspace.subscriptionTier}
        </p>
        <p className="capitalize">
          <strong>Status:</strong> {workspace.billingStatus}
        </p>
        <p>
          <strong>Renews:</strong>{" "}
          {billing?.periodEnd
            ? new Date(billing.periodEnd).toLocaleDateString()
            : "—"}
        </p>

        <a
          href={stripePortalUrl}
          className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded"
        >
          Manage Subscription
        </a>
      </section>

      {/* SEATS */}
      <section className="border p-4 rounded">
        <h2 className="text-lg font-semibold">Seats</h2>

        <p className="mt-2">
          <strong>Current Seats:</strong> {seats.currentSeats}
        </p>
        <p>
          <strong>Max Seats:</strong> {seats.maxSeats}
        </p>

        <div className="mt-4 space-x-3">
          <a
            href={seatCheckoutMonthlyUrl}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Buy Monthly Seat Add‑On
          </a>

          <a
            href={seatCheckoutYearlyUrl}
            className="bg-green-700 text-white px-4 py-2 rounded"
          >
            Buy Yearly Seat Add‑On
          </a>
        </div>
      </section>

      {/* ADD-ONS */}
      <section className="border p-4 rounded">
        <h2 className="text-lg font-semibold">Add‑Ons</h2>

        <p className="mt-2">
          <strong>Active Add‑Ons:</strong>{" "}
          {addons.length === 0
            ? "None"
            : addons.map((a: any) => a.addonType).join(", ")}
        </p>

        <div className="mt-4 space-y-3">
          <a
            href={addonCheckoutUrls.crm}
            className="bg-purple-600 text-white px-4 py-2 rounded block w-fit"
          >
            Buy CRM Add‑On
          </a>

          <a
            href={addonCheckoutUrls.foundations}
            className="bg-indigo-600 text-white px-4 py-2 rounded block w-fit"
          >
            Buy Foundations Add‑On
          </a>

          <a
            href={addonCheckoutUrls.state}
            className="bg-teal-600 text-white px-4 py-2 rounded block w-fit"
          >
            Buy State Grants Add‑On
          </a>
        </div>
      </section>

      {/* USAGE */}
      <section className="border p-4 rounded">
        <h2 className="text-lg font-semibold">Usage</h2>

        <p className="mt-2">
          <strong>Searches:</strong> {billing?.usageSearches ?? 0}
        </p>
        <p>
          <strong>Uploads:</strong> {billing?.usageUploads ?? 0}
        </p>
        <p>
          <strong>AI:</strong> {billing?.usageAI ?? 0}
        </p>
        <p>
          <strong>Members:</strong> {billing?.usageMembers ?? 0}
        </p>
      </section>
    </div>
  );
}

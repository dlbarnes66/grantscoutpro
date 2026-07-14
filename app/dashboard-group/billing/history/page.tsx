"use client";

import { useEffect, useState } from "react";

export default function BillingHistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/billing/history", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const json = await res.json();
      setHistory(json.history || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading history…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Billing History</h1>

      <div className="space-y-4">
        {history.map((h) => (
          <div key={h.id} className="border rounded p-4">
            <p className="font-semibold">
              {new Date(h.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">Amount: {h.amount}</p>
            <p className="text-sm text-gray-600">Status: {h.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

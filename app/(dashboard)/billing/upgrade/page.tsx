"use client";

import { useState } from "react";

export default function BillingUpgradePage() {
  const [loading, setLoading] = useState(false);

  async function upgrade(tier: string) {
    setLoading(true);

    await fetch("/api/billing/upgrade", {
      method: "POST",
      body: JSON.stringify({ tier }),
    });

    setLoading(false);
    alert("Plan upgraded!");
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Upgrade Plan</h1>

      <div className="space-y-4">
        <Plan tier="FEDERAL_ONLY" price="$29/mo" onUpgrade={upgrade} />
        <Plan tier="FEDERAL_STATE" price="$49/mo" onUpgrade={upgrade} />
        <Plan tier="PRO" price="$99/mo" onUpgrade={upgrade} />
        <Plan tier="ENTERPRISE" price="$199/mo" onUpgrade={upgrade} />
      </div>
    </div>
  );
}

function Plan({ tier, price, onUpgrade }: any) {
  return (
    <div className="border rounded p-4">
      <h2 className="font-semibold">{tier}</h2>
      <p className="text-lg">{price}</p>
      <button
        onClick={() => onUpgrade(tier)}
        className="bg-blue-600 text-white px-4 py-2 rounded mt-3"
      >
        Upgrade
      </button>
    </div>
  );
}

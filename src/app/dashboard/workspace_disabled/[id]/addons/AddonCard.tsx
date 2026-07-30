"use client";

import { useState } from "react";

export default function AddonCard({
  addon,
  workspaceId
}: {
  addon: any;
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function activateAddon() {
    setLoading(true);

    const res = await fetch("/api/addons/activate", {
      method: "POST",
      body: JSON.stringify({
        workspaceId,
        addonId: addon.id
      })
    });

    const json = await res.json();
    setLoading(false);

    if (json.success) {
      alert(`${addon.name} activated!`);
      window.location.reload();
    } else {
      alert("Failed to activate add‑on.");
    }
  }

  async function purchaseAddon() {
    setLoading(true);

    const res = await fetch("/api/addons/purchase", {
      method: "POST",
      body: JSON.stringify({
        workspaceId,
        addonId: addon.id
      })
    });

    const json = await res.json();
    setLoading(false);

    if (json.url) {
      window.location.href = json.url;
    } else {
      alert("Failed to start purchase.");
    }
  }

  return (
    <div className="border rounded-lg p-6 shadow-sm bg-white space-y-4">
      <h2 className="text-xl font-bold">{addon.name}</h2>
      <p className="text-gray-700">{addon.description}</p>

      <p className="text-lg font-semibold text-blue-600">
        ${addon.price}/month
      </p>

      {addon.active ? (
        <p className="text-green-600 font-medium">Already Active</p>
      ) : (
        <div className="space-y-3">
          <button
            onClick={activateAddon}
            disabled={loading}
            className="w-full p-3 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Activate Add‑On"}
          </button>

          <button
            onClick={purchaseAddon}
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Purchase Add‑On"}
          </button>
        </div>
      )}
    </div>
  );
}

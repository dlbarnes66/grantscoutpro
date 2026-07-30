"use client";

import { useState } from "react";

export function CompareButton({ grantId }: { grantId: string }) {
  const [loading, setLoading] = useState(false);

  async function compare() {
    try {
      setLoading(true);

      const res = await fetch("/api/grant/compare", {
        method: "POST",
        body: JSON.stringify({ grantId }),
      });

      const data = await res.json();

      if (data.comparisonId) {
        window.location.href = `/dashboard/comparisons/${data.comparisonId}`;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={compare}
      disabled={loading}
      className="px-4 py-2 rounded text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700"
    >
      {loading ? "Comparing..." : "Compare"}
    </button>
  );
}

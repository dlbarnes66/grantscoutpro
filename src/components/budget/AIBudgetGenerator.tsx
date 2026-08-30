"use client";

import React, { useState } from "react";

export function AIBudgetGenerator({
  onGenerateAction,
}: {
  onGenerateAction?: (items: any[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    // Placeholder AI output
    const mock = [
      { id: "1", name: "Personnel", amount: 50000 },
      { id: "2", name: "Equipment", amount: 15000 },
      { id: "3", name: "Travel", amount: 8000 },
    ];

    await new Promise((r) => setTimeout(r, 800));

    onGenerateAction?.(mock);

    setLoading(false);
  };

  return (
    <button
      onClick={generate}
      className="px-4 py-2 bg-blue-600 text-white rounded"
      disabled={loading}
    >
      {loading ? "Generating…" : "Generate AI Budget"}
    </button>
  );
}

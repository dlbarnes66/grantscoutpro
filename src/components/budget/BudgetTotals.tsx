"use client"

import React from "react";

export function BudgetTotals({
  items = [],
}: {
  items?: Array<{ amount: number }>;
}) {
  const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="font-semibold text-lg">Budget Totals</h3>
      <p className="text-xl font-bold mt-2">${total.toLocaleString()}</p>
    </div>
  );
}

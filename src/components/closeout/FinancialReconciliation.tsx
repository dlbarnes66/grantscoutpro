"use client"

import React from "react";

export function FinancialReconciliation({
  entries = [],
}: {
  entries?: Array<{ category: string; budgeted: number; actual: number }>;
}) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Financial Reconciliation</h3>

      {entries.map((e, idx) => (
        <div key={idx} className="border p-4 rounded bg-gray-50">
          <p className="font-medium">{e.category}</p>
          <p>Budgeted: ${e.budgeted.toLocaleString()}</p>
          <p>Actual: ${e.actual.toLocaleString()}</p>
          <p className="font-semibold mt-2">
            Difference: ${(e.actual - e.budgeted).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

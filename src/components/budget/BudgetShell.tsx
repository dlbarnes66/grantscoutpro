"use client";

import React from "react";

export default function BudgetShell({
  budgetId,
  children,
}: {
  budgetId: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Budget {budgetId}</h1>
      {children}
    </div>
  );
}

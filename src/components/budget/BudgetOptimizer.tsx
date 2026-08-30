"use client";

import React from "react";
import { BudgetItem } from "@/app/budget/[budgetId]/page";

export function BudgetOptimizer({
  items,
  onOptimizeAction,
}: {
  items?: BudgetItem[];
  onOptimizeAction?: (optimized: any[]) => void;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      <p className="text-sm text-slate-400">Budget optimizer goes here.</p>
    </div>
  );
}

"use client";

import React from "react";
import { BudgetItem } from "@/app/budget/[budgetId]/page";

export default function BudgetItemList({
  items,
  onChangeAction,
}: {
  items?: BudgetItem[];
  onChangeAction?: (updated: any[]) => void;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      <p className="text-sm text-slate-400">Budget items list goes here.</p>
    </div>
  );
}

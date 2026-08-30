"use client";

import React from "react";

export function BudgetJustification({
  text = "",
  onChangeAction,
}: {
  text?: string;
  onChangeAction?: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="font-semibold">Budget Justification</label>
      <textarea
        className="w-full p-3 border rounded min-h-[150px]"
        value={text}
        onChange={(e) => onChangeAction?.(e.target.value)}
        placeholder="Explain why each budget item is necessary…"
      />
    </div>
  );
}

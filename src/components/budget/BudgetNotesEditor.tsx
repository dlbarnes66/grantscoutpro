"use client";

import React from "react";

export default function BudgetNotesEditor({
  text,
  onChangeAction,
}: {
  text?: string;
  onChangeAction?: (value: string) => void;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      <p className="text-sm text-slate-400">Budget notes editor goes here.</p>
    </div>
  );
}

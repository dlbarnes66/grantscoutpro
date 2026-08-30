"use client";

import React from "react";

export interface CloseoutChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export function CloseoutChecklist({
  items,
  onToggleAction,
}: {
  items?: CloseoutChecklistItem[];
  onToggleAction?: (updated: any[]) => void;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      <p className="text-sm text-slate-400">Closeout checklist goes here.</p>
    </div>
  );
}

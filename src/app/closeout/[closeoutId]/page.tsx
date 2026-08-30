"use client";

import { useState } from "react";

import CloseoutShell from "@/components/closeout/CloseoutShell";
import { CloseoutChecklist } from "@/components/closeout/CloseoutChecklist";
import AICloseoutSummary from "@/components/closeout/AICloseoutSummary";

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface CloseoutPageProps {
  params: {
    closeoutId: string;
  };
}

export default function CloseoutPage({
  params,
}: CloseoutPageProps) {
  const { closeoutId } = params;

  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: "1",
      label: "Final report submitted",
      completed: false,
    },
    {
      id: "2",
      label: "Financials reconciled",
      completed: false,
    },
  ]);

  function handleToggle(updated: any[]) {
    setItems(updated as ChecklistItem[]);
  }

  return (
    <CloseoutShell closeoutId={closeoutId}>
      <div className="space-y-6">
        <CloseoutChecklist
          items={items}
          onToggleAction={handleToggle}
        />

        <AICloseoutSummary />
      </div>
    </CloseoutShell>
  );
}
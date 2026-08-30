"use client";

import { useState } from "react";

import BudgetShell from "@/components/budget/BudgetShell";
import BudgetItemList from "@/components/budget/BudgetItemList";
import BudgetNotesEditor from "@/components/budget/BudgetNotesEditor";
import { AIBudgetGenerator } from "@/components/budget/AIBudgetGenerator";
import { BudgetOptimizer } from "@/components/budget/BudgetOptimizer";

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
}

interface BudgetPageProps {
  params: {
    budgetId: string;
  };
}

export default function BudgetPage({
  params,
}: BudgetPageProps) {
  const { budgetId } = params;

  const [items, setItems] = useState<BudgetItem[]>([]);
  const [notes, setNotes] = useState("");

  function handleItemsChange(updated: any[]) {
    setItems(updated as BudgetItem[]);
  }

  function handleNotesChange(value: string) {
    setNotes(value);
  }

  function handleGenerate(generatedItems: any[]) {
    setItems(generatedItems as BudgetItem[]);
  }

  function handleOptimize(optimizedItems: any[]) {
    setItems(optimizedItems as BudgetItem[]);
  }

  return (
    <BudgetShell budgetId={budgetId}>
      <div className="space-y-6">
        <BudgetItemList
          items={items}
          onChangeAction={handleItemsChange}
        />

        <BudgetNotesEditor
          text={notes}
          onChangeAction={handleNotesChange}
        />

        <AIBudgetGenerator
          onGenerateAction={handleGenerate}
        />

        <BudgetOptimizer
          items={items}
          onOptimizeAction={handleOptimize}
        />
      </div>
    </BudgetShell>
  );
}
"use client";

import { useState } from "react";
import { LineItemEditor } from "@/components/budget/LineItemEditor";
import { BudgetTotals } from "@/components/budget/BudgetTotals";
import { AIBudgetGenerator } from "@/components/budget/AIBudgetGenerator";
import { BudgetJustification } from "@/components/budget/BudgetJustification";
import { BudgetOptimizer } from "@/components/budget/BudgetOptimizer";

export default function BudgetBuilderPage({ params }: { params: { id: string } }) {
  const [items, setItems] = useState([
    { id: "1", category: "Personnel", description: "Program Coordinator", amount: 45000 },
    { id: "2", category: "Supplies", description: "Workshop materials", amount: 5000 }
  ]);

  function updateItem(id: string, field: string, value: any) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), category: "", description: "", amount: 0 }
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      <div className="xl:col-span-3 space-y-6">
        <LineItemEditor
          items={items}
          onUpdate={updateItem}
          onAdd={addItem}
          onRemove={removeItem}
        />

        <BudgetJustification items={items} />
      </div>

      <div className="xl:col-span-1 space-y-6">
        <BudgetTotals items={items} />
        <AIBudgetGenerator onGenerate={(generated) => setItems(generated)} />
        <BudgetOptimizer items={items} onOptimize={(optimized) => setItems(optimized)} />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type BudgetItem = {
  label: string;
  amount: number;
  category: string;
};

export default function BudgetBuilder({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grants/budget?grantId=${grantId}`);
      const json = await res.json();
      if (json.budget?.items) {
        setItems(json.budget.items);
      }
      setLoading(false);
    }
    load();
  }, [grantId]);

  function updateItem(index: number, field: keyof BudgetItem, value: any) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { label: "", amount: 0, category: "" }
    ]);
  }

  async function save() {
    setSaving(true);

    const res = await fetch("/api/grants/budget", {
      method: "POST",
      body: JSON.stringify({
        grantId,
        items,
        useAI
      }),
    });

    const json = await res.json();
    if (json.budget?.items) {
      setItems(json.budget.items);
    }

    setSaving(false);
  }

  const total = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );

  if (loading) {
    return <p>Loading budget...</p>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Budget Line Items</h2>

        <label className="flex items-center space-x-2 text-sm">
          <input
            type="checkbox"
            checked={useAI}
            onChange={() => setUseAI(!useAI)}
          />
          <span>Use AI to draft budget</span>
        </label>
      </div>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
          >
            <input
              type="text"
              className="p-2 border rounded-md"
              placeholder="Label"
              value={item.label}
              onChange={(e) =>
                updateItem(i, "label", e.target.value)
              }
            />
            <input
              type="number"
              className="p-2 border rounded-md"
              placeholder="Amount"
              value={item.amount}
              onChange={(e) =>
                updateItem(i, "amount", Number(e.target.value))
              }
            />
            <input
              type="text"
              className="p-2 border rounded-md"
              placeholder="Category"
              value={item.category}
              onChange={(e) =>
                updateItem(i, "category", e.target.value)
              }
            />
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="px-4 py-2 bg-gray-200 rounded-md text-sm"
      >
        + Add Line Item
      </button>

      <p className="text-lg font-semibold">
        Total: ${total.toLocaleString()}
      </p>

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {saving ? "Saving..." : "Save Budget"}
      </button>
    </div>
  );
}

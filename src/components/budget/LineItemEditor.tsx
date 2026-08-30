"use client";

import React from "react";

export function LineItemEditor({
  items = [],
  onChangeAction,
}: {
  items?: Array<{ id: string; name: string; amount: number }>;
  onChangeAction?: (updated: any[]) => void;
}) {
  const updateItem = (id: string, field: string, value: any) => {
    const updated = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChangeAction?.(updated);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="border p-4 rounded">
          <input
            className="w-full mb-2 p-2 border rounded"
            value={item.name}
            onChange={(e) => updateItem(item.id, "name", e.target.value)}
            placeholder="Line item name"
          />
          <input
            className="w-full p-2 border rounded"
            type="number"
            value={item.amount}
            onChange={(e) =>
              updateItem(item.id, "amount", Number(e.target.value))
            }
            placeholder="Amount"
          />
        </div>
      ))}
    </div>
  );
}

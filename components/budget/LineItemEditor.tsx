"use client";

export function LineItemEditor({
  items,
  onUpdate,
  onAdd,
  onRemove
}: {
  items: any[];
  onUpdate: (id: string, field: string, value: any) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Line Items
        </h2>

        <button
          onClick={onAdd}
          className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
        >
          Add Item
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg bg-slate-800 p-4 border border-slate-700 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                value={item.category}
                onChange={(e) => onUpdate(item.id, "category", e.target.value)}
                placeholder="Category"
                className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />

              <input
                value={item.description}
                onChange={(e) => onUpdate(item.id, "description", e.target.value)}
                placeholder="Description"
                className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />

              <input
                type="number"
                value={item.amount}
                onChange={(e) => onUpdate(item.id, "amount", Number(e.target.value))}
                placeholder="Amount"
                className="rounded-md bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
              />
            </div>

            <button
              onClick={() => onRemove(item.id)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove Item
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

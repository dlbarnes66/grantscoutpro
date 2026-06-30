"use client";

export function FiltersPanel({
  filters,
  onChange
}: {
  filters: any;
  onChange: (v: any) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Filters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-slate-400">Minimum Amount</label>
          <input
            type="number"
            className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            onChange={(e) =>
              onChange({ ...filters, minAmount: Number(e.target.value) })
            }
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Deadline Before</label>
          <input
            type="date"
            className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            onChange={(e) =>
              onChange({ ...filters, deadline: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Category</label>
          <select
            className="mt-1 w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
            onChange={(e) =>
              onChange({ ...filters, category: e.target.value })
            }
          >
            <option value="">Any</option>
            <option value="education">Education</option>
            <option value="health">Health</option>
            <option value="community">Community</option>
            <option value="technology">Technology</option>
          </select>
        </div>
      </div>
    </div>
  );
}

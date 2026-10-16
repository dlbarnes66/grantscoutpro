"use client";

import { Plus, Trash2, RotateCcw } from "lucide-react";
import { MAX_MONTHS, MIN_MONTHS, monthLabel, type WorkPlan, type WorkPlanRow } from "@/lib/ai/workPlan";

const inputCls =
  "w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#00E5FF]/50 disabled:opacity-70";

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

// Editable Work Plan & Timeline template: set the project start and length,
// then edit, add or remove phases. The bar shows where each phase sits in
// the project period.
export default function WorkPlanEditor({
  plan,
  disabled,
  onChange,
  onReset,
}: {
  plan: WorkPlan;
  disabled: boolean;
  onChange: (plan: WorkPlan) => void;
  onReset: () => void;
}) {
  function setRow(index: number, patch: Partial<WorkPlanRow>) {
    onChange({ ...plan, rows: plan.rows.map((r, i) => (i === index ? { ...r, ...patch } : r)) });
  }

  function setDuration(value: string) {
    const months = clamp(Math.round(Number(value)) || plan.durationMonths, MIN_MONTHS, MAX_MONTHS);
    onChange({
      ...plan,
      durationMonths: months,
      rows: plan.rows.map((r) => {
        const s = clamp(r.startMonth, 1, months);
        return { ...r, startMonth: s, endMonth: clamp(r.endMonth, s, months) };
      }),
    });
  }

  function addRow() {
    onChange({
      ...plan,
      rows: [
        ...plan.rows,
        {
          id: `wp-${Date.now().toString(36)}`,
          phase: "New phase",
          activity: "",
          owner: "",
          startMonth: 1,
          endMonth: plan.durationMonths,
          milestone: "",
        },
      ],
    });
  }

  const endLabel = monthLabel(plan.startDate, plan.durationMonths);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="text-[12px] text-slate-400">
          Project start date
          <input
            type="date"
            value={plan.startDate || ""}
            disabled={disabled}
            onChange={(e) => onChange({ ...plan, startDate: e.target.value || null })}
            className={`${inputCls} mt-1 w-44`}
          />
        </label>
        <label className="text-[12px] text-slate-400">
          Length (months)
          <input
            type="number"
            min={MIN_MONTHS}
            max={MAX_MONTHS}
            value={plan.durationMonths}
            disabled={disabled}
            onChange={(e) => setDuration(e.target.value)}
            className={`${inputCls} mt-1 w-28`}
          />
        </label>
        <p className="pb-2 text-[12px] text-slate-500">
          {plan.startDate
            ? `Runs through ${endLabel}. These dates fill SF-424 item 17 on federal applications.`
            : "Add a start date to show calendar months and fill SF-424 item 17."}
        </p>
      </div>

      <div className="space-y-3">
        {plan.rows.map((r, i) => {
          const left = ((r.startMonth - 1) / plan.durationMonths) * 100;
          const width = ((r.endMonth - r.startMonth + 1) / plan.durationMonths) * 100;
          return (
            <div key={r.id} className="space-y-2 rounded-md border border-white/[0.06] p-3">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-slate-400">Phase {i + 1}</span>
                <input
                  value={r.phase}
                  disabled={disabled}
                  onChange={(e) => setRow(i, { phase: e.target.value })}
                  className={`${inputCls} font-medium`}
                  placeholder="Phase name"
                />
                {!disabled && (
                  <button
                    title="Remove phase"
                    onClick={() => onChange({ ...plan, rows: plan.rows.filter((_, j) => j !== i) })}
                    className="text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <textarea
                value={r.activity}
                disabled={disabled}
                rows={2}
                onChange={(e) => setRow(i, { activity: e.target.value })}
                className={`${inputCls} resize-y`}
                placeholder="Activities in this phase"
              />
              <div className="grid grid-cols-2 gap-2 md:grid-cols-[1.4fr_90px_90px_1.6fr]">
                <input
                  value={r.owner}
                  disabled={disabled}
                  onChange={(e) => setRow(i, { owner: e.target.value })}
                  className={inputCls}
                  placeholder="Responsible (role or name)"
                />
                <input
                  type="number"
                  min={1}
                  max={plan.durationMonths}
                  value={r.startMonth}
                  disabled={disabled}
                  title="Start month"
                  onChange={(e) => {
                    const s = clamp(Math.round(Number(e.target.value)) || 1, 1, plan.durationMonths);
                    setRow(i, { startMonth: s, endMonth: Math.max(r.endMonth, s) });
                  }}
                  className={inputCls}
                />
                <input
                  type="number"
                  min={r.startMonth}
                  max={plan.durationMonths}
                  value={r.endMonth}
                  disabled={disabled}
                  title="End month"
                  onChange={(e) => setRow(i, { endMonth: clamp(Math.round(Number(e.target.value)) || r.startMonth, r.startMonth, plan.durationMonths) })}
                  className={inputCls}
                />
                <input
                  value={r.milestone}
                  disabled={disabled}
                  onChange={(e) => setRow(i, { milestone: e.target.value })}
                  className={inputCls}
                  placeholder="Milestone or deliverable"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="relative h-2 flex-1 rounded bg-white/[0.06]">
                  <div className="absolute top-0 h-2 rounded bg-[#00E5FF]/70" style={{ left: `${left}%`, width: `${width}%` }} />
                </div>
                <span className="w-44 text-right text-[11.5px] text-slate-500">
                  Months {r.startMonth}-{r.endMonth}
                  {plan.startDate && ` · ${monthLabel(plan.startDate, r.startMonth)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!disabled && (
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={addRow} className="inline-flex items-center gap-1 text-[12.5px] text-[#00E5FF] hover:underline">
            <Plus size={13} /> Add phase
          </button>
          <button
            onClick={() => {
              if (confirm("Replace this plan with the standard template? Your edits to the phases will be lost.")) onReset();
            }}
            className="inline-flex items-center gap-1 text-[12.5px] text-slate-400 hover:text-white"
          >
            <RotateCcw size={13} /> Reset to template
          </button>
        </div>
      )}

      <label className="block text-[12px] text-slate-400">
        Notes (optional, added after the phases)
        <textarea
          value={plan.notes}
          disabled={disabled}
          rows={3}
          onChange={(e) => onChange({ ...plan, notes: e.target.value })}
          className={`${inputCls} mt-1 resize-y`}
          placeholder="Anything else about timing, dependencies or key dates"
        />
      </label>
    </div>
  );
}

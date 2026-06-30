"use client";

export function PipelineOverview() {
  const stages = [
    { label: "Searching", count: 12 },
    { label: "Drafting", count: 4 },
    { label: "Budgeting", count: 3 },
    { label: "Reviewing", count: 2 },
    { label: "Submitting", count: 1 }
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Grant Pipeline Overview
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stages.map((stage) => (
          <div
            key={stage.label}
            className="rounded-lg bg-slate-800 p-4 text-center"
          >
            <div className="text-2xl font-bold text-slate-100">
              {stage.count}
            </div>
            <div className="text-xs text-slate-400">{stage.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

export function KPISnapshot() {
  const kpis = [
    { label: "Avg Match Score", value: "82%" },
    { label: "Submission Readiness", value: "74%" },
    { label: "Compliance Health", value: "91%" }
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        KPI Snapshot
      </h2>

      <div className="space-y-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-300">{kpi.label}</span>
            <span className="font-semibold text-slate-100">{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

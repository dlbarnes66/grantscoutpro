"use client"

import { MonitoringKPI } from "./types";

export default function MonitoringKPIs({
  kpis
}: {
  kpis: MonitoringKPI[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Key Performance Indicators
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const percent = Math.round((kpi.current / kpi.target) * 100);
          const color =
            percent < 50
              ? "text-red-400"
              : percent < 80
              ? "text-yellow-400"
              : "text-green-400";

          return (
            <div key={i} className="rounded-lg bg-slate-800 p-4 space-y-2">
              <div className="text-sm text-slate-300">{kpi.label}</div>
              <div className={`text-3xl font-bold ${color}`}>{percent}%</div>
              <div className="text-xs text-slate-400">
                {kpi.current} / {kpi.target}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

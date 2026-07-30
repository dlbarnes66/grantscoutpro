"use client";

import { OutcomeReportingItem } from "./types";

export default function OutcomeReporting({
  outcomes
}: {
  outcomes: OutcomeReportingItem[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Outcome Reporting
      </h2>

      {outcomes.map((o) => (
        <div key={o.id} className="space-y-2">
          <div className="text-sm text-slate-300">{o.label}</div>

          <textarea
            placeholder="Describe evidence of this outcome..."
            className="w-full h-24 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}

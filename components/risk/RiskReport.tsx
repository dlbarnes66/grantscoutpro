"use client";

import { RiskReportData } from "./types";

export default function RiskReport({
  report
}: {
  report: RiskReportData;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <div>
        <div className="text-xs text-slate-400">Risk Score</div>
        <div className="text-3xl font-bold text-red-400">
          {report.risk_score}/100
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          Summary
        </h2>
        <p className="text-slate-300 text-sm">{report.summary}</p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          Compliance Issues
        </h2>
        <ul className="space-y-1 text-sm text-red-300">
          {report.compliance_issues.map((i, idx) => (
            <li key={idx}>• {i}</li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-100 mb-2">
          Recommendations
        </h2>
        <ul className="space-y-1 text-sm text-green-300">
          {report.recommendations.map((r, idx) => (
            <li key={idx}>• {r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { MonitoringAlert } from "./types";

export default function MonitoringAlerts({
  alerts
}: {
  alerts: MonitoringAlert[];
}) {
  const colorMap: Record<MonitoringAlert["type"], string> = {
    warning: "text-yellow-400",
    critical: "text-red-400"
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">Alerts</h2>

      <ul className="space-y-3 text-sm">
        {alerts.map((alert) => (
          <li key={alert.id} className="flex items-center gap-3">
            <span className={`font-semibold ${colorMap[alert.type]}`}>
              {alert.type.toUpperCase()}
            </span>
            <span className="text-slate-300">{alert.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

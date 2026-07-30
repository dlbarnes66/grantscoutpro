"use client";

import { WebhookLogEntry } from "./types";

export default function WebhookLogs({
  logs,
}: {
  logs: WebhookLogEntry[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Delivery Logs
      </h2>

      {logs.length === 0 && (
        <div className="text-slate-400 text-sm">No deliveries yet.</div>
      )}

      <ul className="space-y-4 text-sm text-slate-300">
        {logs.map((log, i) => (
          <li key={i} className="rounded-lg bg-slate-800 p-4 space-y-1">
            <div className="font-semibold text-slate-100">
              {log.event} → {log.url}
            </div>
            <div>Status: {log.status}</div>
            <div>Timestamp: {log.timestamp}</div>
            <div className="text-xs text-slate-500">
              Payload: {log.payload}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

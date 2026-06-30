"use client";

import { SeverityBadge } from "./SeverityBadge";

export function AuditTable({
  logs,
  onSelect
}: {
  logs: any[];
  onSelect: (l: any) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <table className="w-full text-sm text-slate-300">
        <thead>
          <tr className="text-slate-400">
            <th className="text-left py-2">Actor</th>
            <th className="text-left py-2">Action</th>
            <th className="text-left py-2">Resource</th>
            <th className="text-left py-2">Severity</th>
            <th className="text-left py-2">Timestamp</th>
            <th className="text-left py-2">Details</th>
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-t border-slate-800">
              <td className="py-2">{log.actor}</td>
              <td className="py-2">{log.action}</td>
              <td className="py-2">{log.resource}</td>
              <td className="py-2">
                <SeverityBadge level={log.severity} />
              </td>
              <td className="py-2">{log.timestamp}</td>
              <td className="py-2">
                <button
                  onClick={() => onSelect(log)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

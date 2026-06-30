"use client";

export function AuditDetailDrawer({
  log,
  onClose
}: {
  log: any;
  onClose: () => void;
}) {
  return (
    <div className="fixed right-0 top-0 w-96 h-full bg-slate-900 border-l border-slate-800 p-6 space-y-4 shadow-xl">
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 text-sm"
      >
        Close
      </button>

      <h2 className="text-sm font-semibold text-slate-100">
        Audit Event Details
      </h2>

      <div className="space-y-2 text-sm text-slate-300">
        <div><strong>Actor:</strong> {log.actor}</div>
        <div><strong>Action:</strong> {log.action}</div>
        <div><strong>Resource:</strong> {log.resource}</div>
        <div><strong>Timestamp:</strong> {log.timestamp}</div>
        <div><strong>IP Address:</strong> {log.ip}</div>
      </div>

      <div className="pt-4">
        <h3 className="text-xs font-semibold text-slate-400">Metadata</h3>
        <pre className="bg-slate-800 p-3 rounded-md text-xs text-slate-300 overflow-auto">
{JSON.stringify(log.metadata, null, 2)}
        </pre>
      </div>
    </div>
  );
}

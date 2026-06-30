export function APILogViewer({ logs }: { logs: any[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        API Request Logs
      </h2>

      {logs.length === 0 && (
        <div className="text-slate-400 text-sm">No requests yet.</div>
      )}

      <ul className="space-y-4 text-sm text-slate-300">
        {logs.map((log, i) => (
          <li key={i} className="rounded-lg bg-slate-800 p-4 space-y-1">
            <div className="font-semibold text-slate-100">
              {log.method} {log.endpoint}
            </div>
            <div>Timestamp: {log.timestamp}</div>
            <div className="text-xs text-slate-500">
              Response: {JSON.stringify(log.response)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

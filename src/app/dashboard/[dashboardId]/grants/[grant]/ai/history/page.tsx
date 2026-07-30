"use client";

import { useEffect, useState } from "react";

export default function AIHistoryPage({ params }: any) {
  const { grantId } = params;

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grant/${grantId}/ai/history`);
      const data = await res.json();
      setHistory(data);
      setLoading(false);
    }
    load();
  }, [grantId]);

  if (loading) {
    return <div className="p-6 text-slate-300">Loading history…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">AI History</h1>

      {history.length === 0 ? (
        <p className="text-slate-400">No AI history yet.</p>
      ) : (
        <div className="space-y-4">
          {history.map((h) => (
            <div
              key={h.id}
              className="rounded border border-slate-800 bg-slate-900/60 p-4"
            >
              <div className="text-slate-100 font-semibold">
                {h.type} — {new Date(h.createdAt).toLocaleString()}
              </div>
              <div className="text-slate-300 text-sm mt-2 whitespace-pre-line">
                {h.analysis}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

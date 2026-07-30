"use client";

import { MatchResultItem } from "./types";

export function MatchResults({ results }: { results: MatchResultItem[] }) {
  if (!results || results.length === 0) {
    return <div className="text-slate-400">No results yet.</div>;
  }

  return (
    <div className="space-y-4">
      {results.map((r) => (
        <div
          key={r.grant.id}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-2"
        >
          <div className="text-lg font-semibold text-slate-100">
            {r.grant.title}
          </div>

          <div className="text-sm text-blue-400 font-semibold">
            Score: {r.score}/100
          </div>

          <div className="text-sm text-slate-300">
            {r.explanation}
          </div>
        </div>
      ))}
    </div>
  );
}

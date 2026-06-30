"use client";

import { GrantCard } from "./GrantCard";
import { ResultsSkeleton } from "./ResultsSkeleton";

export function GrantResults({
  results,
  loading
}: {
  results: any[];
  loading: boolean;
}) {
  if (loading) return <ResultsSkeleton />;

  if (!results.length)
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">
        No results yet. Try searching for grants.
      </div>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {results.map((grant) => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
}

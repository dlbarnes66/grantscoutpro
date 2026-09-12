"use client";

import { useEffect, useState } from "react";
import { GrantComparisonResult } from "./types";

function money(n: number | null) {
  if (n === null || n === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function scoreLabel(n: number | null) {
  return n === null || n === undefined ? "Not assessed" : n.toFixed(0);
}

export default function GrantComparisonPanel({
  workspaceId,
  grantIds,
}: {
  workspaceId: string;
  grantIds: string[];
}) {
  const [result, setResult] = useState<GrantComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || grantIds.length < 2) return;

    let cancelled = false;

    async function compare() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/grants/compare`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ grantIds }),
          }
        );
        const data: GrantComparisonResult = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setError(data?.error || "Comparison failed");
          return;
        }
        setResult(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Comparison failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    compare();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, JSON.stringify(grantIds)]);

  if (grantIds.length < 2) {
    return (
      <p className="text-slate-400">
        Select at least 2 grants to compare.
      </p>
    );
  }

  if (loading) {
    return <p className="text-slate-400">Comparing grants...</p>;
  }

  if (error) {
    return <p className="text-red-400 text-sm">{error}</p>;
  }

  if (!result) return null;

  return (
    <div className="space-y-6">
      {result.ignored.length > 0 && (
        <p className="text-amber-400 text-sm">
          {result.ignored.length} selected grant
          {result.ignored.length === 1 ? "" : "s"} couldn&apos;t be loaded
          (not found in this workspace).
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-left text-slate-300">
              <th className="p-3 font-medium">Grant</th>
              {result.compared.map((g) => (
                <th key={g.id} className="p-3 font-medium align-top">
                  {g.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            <tr>
              <td className="p-3 text-slate-400">Agency</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">{g.agency || "—"}</td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Status</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3 capitalize">{g.status}</td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Category</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">{g.category || "—"}</td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Award range</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">
                  {money(g.awardFloor)} - {money(g.awardCeiling)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Deadline</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">
                  {g.deadline
                    ? new Date(g.deadline).toLocaleDateString()
                    : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Eligibility score</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">{scoreLabel(g.aiEligibilityScore)}</td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Alignment score</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">{scoreLabel(g.aiAlignmentScore)}</td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Competitiveness score</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">{scoreLabel(g.aiCompetitivenessScore)}</td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-400">Risk score</td>
              {result.compared.map((g) => (
                <td key={g.id} className="p-3">{scoreLabel(g.aiRiskScore)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {result.aiSummary && (
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 space-y-2">
          <h3 className="font-semibold text-[#00E5FF]">AI Recommendation</h3>
          <p className="text-sm text-slate-200 whitespace-pre-wrap">
            {result.aiSummary}
          </p>
        </div>
      )}
    </div>
  );
}

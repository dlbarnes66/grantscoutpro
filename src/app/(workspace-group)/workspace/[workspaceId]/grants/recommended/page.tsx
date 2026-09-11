"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ExternalLink } from "lucide-react";

function scoreColor(score: number | null | undefined) {
  if (score == null) return "text-slate-500 border-white/[0.1] bg-white/[0.03]";
  if (score >= 75) return "text-emerald-400 border-emerald-400/30 bg-emerald-400/[0.08]";
  if (score >= 50) return "text-[#00E5FF] border-[#00E5FF]/30 bg-[#00E5FF]/[0.08]";
  return "text-slate-400 border-white/[0.1] bg-white/[0.03]";
}

function formatDeadline(deadline: string | null | undefined) {
  if (!deadline) return "No deadline listed";
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return "No deadline listed";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function RecommendedGrantsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [results, setResults] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/grants/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Failed to load recommendations (${res.status}).`);
      }

      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load recommendations.");
    } finally {
      setLoading(false);
    }
  };

  // Loads automatically - a nonprofit user shouldn't have to know to click
  // a "Load Recommendations" button to see grants the AI already matched
  // for them. The button below is now just a manual refresh.
  useEffect(() => {
    if (workspaceId) loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  return (
    <div className="min-h-screen bg-[#0A1A2F] p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recommended Grants</h1>
          <p className="mt-1 text-[13px] text-slate-400">
            Grants matched to your organization's profile by AI, best match first. New matches show up here
            automatically as the scanner finds them.
          </p>
        </div>
        <button
          onClick={loadRecommendations}
          disabled={loading}
          className="flex shrink-0 items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:border-white/[0.2] disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}

      {loading && !results && (
        <div className="mt-6 flex items-center gap-2 text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading recommendations...
        </div>
      )}

      {results && results.length === 0 && !error && (
        <p className="mt-6 text-[13px] text-slate-500">
          No open matches yet. Make sure your organization profile (mission and focus areas) is filled in under
          Onboarding - the more complete it is, the better the matches.
        </p>
      )}

      {results && results.length > 0 && (
        <div className="mt-6 space-y-3">
          {results.map((grant) => (
            <div key={grant.id} className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-semibold text-white">{grant.title}</h2>
                  <p className="mt-0.5 text-[13px] text-slate-400">{grant.agency || "Unknown agency"}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[12px] font-medium ${scoreColor(
                    grant.aiEligibilityScore
                  )}`}
                >
                  {grant.aiEligibilityScore != null ? `${grant.aiEligibilityScore}/100` : "Not yet scored"}
                </span>
              </div>

              {grant.aiSummary && <p className="mt-3 text-[13px] text-slate-300">{grant.aiSummary}</p>}

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-slate-500">
                <span>Deadline: {formatDeadline(grant.deadline)}</span>
                {grant.geographicFocus && <span>Focus: {grant.geographicFocus}</span>}
                {grant.awardCeiling && <span>Up to ${Number(grant.awardCeiling).toLocaleString()}</span>}
              </div>

              {grant.url && (
                <a
                  href={grant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[12px] font-medium text-[#00E5FF] hover:underline"
                >
                  View source <ExternalLink size={12} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

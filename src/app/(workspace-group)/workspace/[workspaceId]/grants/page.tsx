"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { Search, RefreshCw, PackageCheck, Scale } from "lucide-react";

interface Grant {
  id: string;
  title: string;
  agency: string | null;
  category: string | null;
  status: string;
  summary: string | null;
  awardFloor: number | null;
  awardCeiling: number | null;
  deadline: string | null;
  url: string | null;
}

interface SearchStatus {
  plan: string;
  limit: number | null;
  used: number;
  remaining: number | null;
  resetAt: string;
}

function formatMoney(n: number | null) {
  if (n === null || n === undefined) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function WorkspaceGrantsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [grants, setGrants] = useState<Grant[]>([]);
  const [loadingGrants, setLoadingGrants] = useState(true);
  const [status, setStatus] = useState<SearchStatus | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 4) {
        next.add(id);
      }
      return next;
    });
  }

  async function loadGrants() {
    setLoadingGrants(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/list`);
      const json = await res.json();
      if (res.ok) setGrants(json.grants || []);
    } finally {
      setLoadingGrants(false);
    }
  }

  async function loadStatus() {
    const res = await fetch(`/api/workspaces/${workspaceId}/grants/search-now`);
    const json = await res.json();
    if (res.ok) setStatus(json);
  }

  useEffect(() => {
    if (!workspaceId) return;
    loadGrants();
    loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  async function runSearch() {
    setSearching(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/search-now`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error || "Search failed");
      }

      setMessage(
        json.newGrants > 0
          ? `Found ${json.newGrants} new grant${json.newGrants === 1 ? "" : "s"} (${json.totalResults} total matched).`
          : `No new grants found (${json.totalResults} matched, already tracked).`
      );

      await loadGrants();
      await loadStatus();
    } catch (err: any) {
      setError(err?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  }

  const searchDisabled =
    searching || (status?.limit !== null && (status?.remaining ?? 0) <= 0);

  return (
    <WorkspaceShell title="Grant Opportunities" workspaceId={workspaceId}>
      <div className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">Grant Opportunities</h1>
              <p className="text-slate-400 text-sm mt-1">
                Federal grants are scraped automatically twice a day. Need
                something sooner? Run a manual search below.
              </p>
            </div>

            {status && (
              <span className="text-xs uppercase tracking-wide text-slate-500">
                {status.limit === null
                  ? "Unlimited manual searches"
                  : `${status.remaining} of ${status.limit} manual searches left today`}
              </span>
            )}
          </div>

          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keyword (optional) - e.g. housing, workforce development"
              className="flex-1 min-w-[240px] p-3 rounded-lg text-black"
            />

            <button
              onClick={runSearch}
              disabled={searchDisabled}
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {searching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              {searching ? "Searching..." : "Search Now"}
            </button>
          </div>

          {status?.limit !== null && (status?.remaining ?? 0) <= 0 && (
            <p className="text-amber-400 text-sm">
              You&apos;ve used all your manual searches for today on the{" "}
              {status?.plan} plan. It resets in 24 hours, or upgrade your
              plan for more.
            </p>
          )}

          {message && <p className="text-[#00E5FF] text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </Card>

        <div>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
            <h2 className="text-lg font-semibold">
              Tracked Grants {!loadingGrants && `(${grants.length})`}
            </h2>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">
                {selected.size > 0
                  ? `${selected.size} of 4 selected`
                  : "Select 2-4 grants to compare"}
              </span>
              <Link
                href={`/workspace/${workspaceId}/grants/compare?ids=${Array.from(
                  selected
                ).join(",")}`}
                aria-disabled={selected.size < 2}
                onClick={(e) => {
                  if (selected.size < 2) e.preventDefault();
                }}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
                  selected.size < 2
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-[#00E5FF] text-[#06131F] hover:opacity-90"
                }`}
              >
                <Scale size={14} />
                Compare Selected
              </Link>
            </div>
          </div>

          {loadingGrants && <p className="text-slate-400">Loading grants...</p>}

          {!loadingGrants && grants.length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-slate-400">
                No grants tracked yet. Run a manual search above, or wait for
                the next automatic scrape.
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grants.map((grant) => (
              <Card
                key={grant.id}
                className={`p-5 space-y-2 ${
                  selected.has(grant.id) ? "ring-2 ring-[#00E5FF]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(grant.id)}
                      onChange={() => toggleSelect(grant.id)}
                      disabled={!selected.has(grant.id) && selected.size >= 4}
                      className="mt-1"
                    />
                    <p className="font-semibold">{grant.title}</p>
                  </label>
                  <span className="text-xs uppercase tracking-wide text-slate-500 shrink-0">
                    {grant.status}
                  </span>
                </div>

                {grant.agency && (
                  <p className="text-sm text-slate-400">{grant.agency}</p>
                )}

                {(grant.awardFloor || grant.awardCeiling) && (
                  <p className="text-sm text-slate-300">
                    {formatMoney(grant.awardFloor)} - {formatMoney(grant.awardCeiling)}
                  </p>
                )}

                {grant.deadline && (
                  <p className="text-sm text-slate-400">
                    Deadline: {new Date(grant.deadline).toLocaleDateString()}
                  </p>
                )}

                {grant.url && (
                  <a
                    href={grant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#00E5FF] hover:underline inline-block"
                  >
                    View on Grants.gov
                  </a>
                )}

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Link
                    href={`/workspace/${workspaceId}/grants/${grant.id}/package`}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3 py-1.5 text-[13px] font-medium text-[#06131F] hover:opacity-90"
                  >
                    <PackageCheck size={14} />
                    Build Submission Package with AI
                  </Link>
                  <Link
                    href={`/workspace/${workspaceId}/grants/${grant.id}/negotiation`}
                    className="text-sm text-[#00E5FF] hover:underline inline-block"
                  >
                    Negotiation Prep &rarr;
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}

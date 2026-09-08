"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import { Sparkles, Handshake, PackageCheck, Loader2 } from "lucide-react";

interface GrantDetail {
  id: string;
  title: string;
  agency: string | null;
  category: string | null;
  summary: string | null;
  status: string;
  awardFloor: number | null;
  awardCeiling: number | null;
  amountMin: number | null;
  amountMax: number | null;
  deadline: string | null;
  openDate: string | null;
  url: string | null;
  aiEligibilityScore: number | null;
  aiSummary: string | null;
  aiRecommendations: { whatsNeeded?: string[] } | null;
}

function formatMoney(n: number | null | undefined) {
  if (n === null || n === undefined) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function formatDate(d: string | null) {
  if (!d) return "Not specified";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function scoreColor(score: number) {
  if (score >= 75) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-slate-400";
}

export default function GrantDetailPage() {
  const params = useParams() as { workspaceId: string; grantId: string };
  const { workspaceId, grantId } = params;

  const [grant, setGrant] = useState<GrantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/grants/${grantId}/detail?workspaceId=${workspaceId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load grant");
        if (!cancelled) setGrant(data);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load grant");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (workspaceId && grantId) load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, grantId]);

  const whatsNeeded = grant?.aiRecommendations?.whatsNeeded || [];
  const awardFloor = grant?.awardFloor ?? grant?.amountMin ?? null;
  const awardCeiling = grant?.awardCeiling ?? grant?.amountMax ?? null;

  return (
    <WorkspaceShell title="Grant" workspaceId={workspaceId}>
      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading grant...
        </div>
      )}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && grant && (
        <div className="space-y-5">
          <div>
            <p className="text-[12.5px] uppercase tracking-wide text-slate-500">{grant.agency || "Federal Opportunity"}</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">{grant.title}</h1>
          </div>

          {grant.aiEligibilityScore !== null && (
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-[#00E5FF]" />
                  <span className="text-[13px] font-medium text-white">AI Match Score</span>
                </div>
                <span className={`text-2xl font-bold ${scoreColor(grant.aiEligibilityScore)}`}>
                  {grant.aiEligibilityScore}/100
                </span>
              </div>
              {grant.aiSummary && <p className="mt-2 text-[13px] text-slate-300">{grant.aiSummary}</p>}
              {whatsNeeded.length > 0 && (
                <div className="mt-3">
                  <p className="text-[12px] font-medium text-slate-400">What's likely needed to apply:</p>
                  <ul className="mt-1.5 space-y-1">
                    {whatsNeeded.map((item, i) => (
                      <li key={i} className="text-[12.5px] text-slate-400">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          <Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            <div>
              <p className="text-[11.5px] text-slate-500">Opens</p>
              <p className="mt-0.5 text-[13px] text-white">{formatDate(grant.openDate)}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-slate-500">Closes</p>
              <p className="mt-0.5 text-[13px] text-white">{formatDate(grant.deadline)}</p>
            </div>
            <div>
              <p className="text-[11.5px] text-slate-500">Award range</p>
              <p className="mt-0.5 text-[13px] text-white">
                {awardFloor || awardCeiling
                  ? `${formatMoney(awardFloor) || "?"} - ${formatMoney(awardCeiling) || "?"}`
                  : "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-[11.5px] text-slate-500">Status</p>
              <p className="mt-0.5 text-[13px] capitalize text-white">{grant.status}</p>
            </div>
          </Card>

          {grant.summary && (
            <Card className="p-5">
              <p className="text-[12px] font-medium text-slate-400">Summary</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-slate-300">{grant.summary}</p>
            </Card>
          )}

          <div className="flex flex-wrap gap-2.5">
            <Link
              href={`/workspace/${workspaceId}/grants/${grantId}/package`}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3.5 py-2 text-[13px] font-medium text-[#06131F] hover:opacity-90"
            >
              <PackageCheck size={15} />
              Build Submission Package with AI
            </Link>
            <Link
              href={`/workspace/${workspaceId}/grants/${grantId}/negotiation`}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] px-3.5 py-2 text-[13px] font-medium text-slate-200 hover:bg-white/[0.04]"
            >
              <Handshake size={15} />
              Negotiation Prep
            </Link>
            {grant.url && (
              <a
                href={grant.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] px-3.5 py-2 text-[13px] font-medium text-slate-200 hover:bg-white/[0.04]"
              >
                View original listing
              </a>
            )}
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

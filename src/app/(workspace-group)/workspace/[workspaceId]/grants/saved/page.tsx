"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import { Download, BookmarkX, Loader2 } from "lucide-react";

interface SavedGrantEntry {
  id: string;
  grantId: string;
  createdAt: string;
  grant: {
    id: string;
    workspaceId: string;
    title: string;
    agency: string | null;
    awardFloor: number | null;
    awardCeiling: number | null;
    amountMin: number | null;
    amountMax: number | null;
    deadline: string | null;
    summary: string | null;
  };
}

function formatMoney(n: number | null | undefined) {
  if (n === null || n === undefined) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function SavedGrantsPage() {
  const params = useParams() as { workspaceId: string };
  const { workspaceId } = params;

  const [entries, setEntries] = useState<SavedGrantEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/saved-grant");
        const data = await res.json();
        if (!cancelled && res.ok) {
          const filtered = (data.savedGrants || []).filter(
            (e: SavedGrantEntry) => e.grant?.workspaceId === workspaceId
          );
          setEntries(filtered);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (workspaceId) load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  async function removeSaved(grantId: string) {
    setRemovingId(grantId);
    try {
      await fetch(`/api/saved-grant/${grantId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unsave" }),
      });
      setEntries((prev) => prev.filter((e) => e.grantId !== grantId));
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <WorkspaceShell title="Saved Grants" workspaceId={workspaceId}>
      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading saved grants...
        </div>
      )}

      {!loading && entries.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-slate-400">
            You haven&apos;t saved any grants in this workspace yet. Open a grant and click
            &ldquo;Save Grant&rdquo; to keep it here for later.
          </p>
          <Link
            href={`/workspace/${workspaceId}/grants`}
            className="mt-4 inline-block rounded-md bg-[#00E5FF] px-3.5 py-2 text-[13px] font-medium text-[#06131F] hover:opacity-90"
          >
            Browse Grants
          </Link>
        </Card>
      )}

      {!loading && entries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entries.map(({ grant, grantId }) => {
            const awardFloor = grant.awardFloor ?? grant.amountMin ?? null;
            const awardCeiling = grant.awardCeiling ?? grant.amountMax ?? null;
            return (
              <Card key={grantId} className="p-5 space-y-2">
                <p className="font-semibold text-white">{grant.title}</p>
                {grant.agency && <p className="text-sm text-slate-400">{grant.agency}</p>}
                {(awardFloor || awardCeiling) && (
                  <p className="text-sm text-slate-300">
                    {formatMoney(awardFloor)} - {formatMoney(awardCeiling)}
                  </p>
                )}
                {grant.deadline && (
                  <p className="text-sm text-slate-400">
                    Deadline: {new Date(grant.deadline).toLocaleDateString()}
                  </p>
                )}
                {grant.summary && (
                  <p className="text-sm text-slate-400 line-clamp-3">{grant.summary}</p>
                )}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <Link
                    href={`/workspace/${workspaceId}/grants/${grantId}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] px-3 py-1.5 text-[13px] font-medium text-slate-200 hover:bg-white/[0.04]"
                  >
                    View
                  </Link>
                  <a
                    href={`/api/grants/${grantId}/download?workspaceId=${workspaceId}`}
                    className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] px-3 py-1.5 text-[13px] font-medium text-slate-200 hover:bg-white/[0.04]"
                  >
                    <Download size={14} />
                    Download
                  </a>
                  <button
                    type="button"
                    onClick={() => removeSaved(grantId)}
                    disabled={removingId === grantId}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 px-3 py-1.5 text-[13px] font-medium text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                  >
                    <BookmarkX size={14} />
                    Remove
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </WorkspaceShell>
  );
}

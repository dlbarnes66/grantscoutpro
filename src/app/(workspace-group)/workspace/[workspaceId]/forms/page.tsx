"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";

interface FormRow {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "closed";
  shareSlug: string;
  grantTitle: string | null;
  responseCount: number;
  createdAt: string;
  updatedAt: string;
}

function StatusBadge({ status }: { status: FormRow["status"] }) {
  const styles: Record<string, string> = {
    draft: "bg-slate-700 text-slate-300",
    published: "bg-emerald-900/60 text-emerald-300",
    closed: "bg-amber-900/60 text-amber-300",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status] || styles.draft}`}>
      {status}
    </span>
  );
}

export default function WorkspaceFormsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const [forms, setForms] = useState<FormRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/forms`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load forms");
        if (!cancelled) setForms(json.forms || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load forms");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (workspaceId) load();
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return (
    <WorkspaceShell title="Forms" workspaceId={workspaceId}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[13px] text-slate-500">
            AI-generated forms you can share with donors, volunteers, or grant applicants.
          </p>
          <Link
            href={`/workspace/${workspaceId}/forms/new`}
            className="rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-medium text-[#06131F] hover:opacity-90"
          >
            + New Form
          </Link>
        </div>

        {loading && <p className="text-[13px] text-slate-500">Loading forms...</p>}
        {error && <p className="text-[13px] text-red-400">{error}</p>}

        {!loading && !error && forms.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-slate-400">No forms yet.</p>
            <Link href={`/workspace/${workspaceId}/forms/new`} className="mt-2 inline-block text-[#00E5FF] hover:underline">
              Describe one and let AI build it
            </Link>
          </Card>
        )}

        {!loading && !error && forms.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {forms.map((form) => (
              <Link key={form.id} href={`/workspace/${workspaceId}/forms/${form.id}`}>
                <Card className="p-5 h-full transition hover:border-[#00E5FF]">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-white">{form.title}</p>
                    <StatusBadge status={form.status} />
                  </div>
                  {form.grantTitle && (
                    <p className="mt-1 text-[12px] text-slate-500">For grant: {form.grantTitle}</p>
                  )}
                  {form.description && (
                    <p className="mt-2 text-[13px] text-slate-400 line-clamp-2">{form.description}</p>
                  )}
                  <p className="mt-3 text-[12px] text-slate-500">
                    {form.responseCount} response{form.responseCount === 1 ? "" : "s"}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

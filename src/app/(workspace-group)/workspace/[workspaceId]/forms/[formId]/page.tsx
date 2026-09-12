"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";

interface FieldSpec {
  id: string;
  type: string;
  label: string;
  required: boolean;
}

interface FormResponse {
  id: string;
  data: Record<string, any>;
  respondentEmail: string | null;
  submittedAt: string;
}

interface FormDetail {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "published" | "closed";
  shareSlug: string;
  fields: FieldSpec[];
  responses: FormResponse[];
  grant: { id: string; title: string } | null;
}

export default function WorkspaceFormDetailPage() {
  const routeParams = useParams();
  const router = useRouter();
  const workspaceId = routeParams.workspaceId as string;
  const formId = routeParams.formId as string;

  const [form, setForm] = useState<FormDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/forms/${formId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load form");
      setForm(json.form);
    } catch (err: any) {
      setError(err?.message || "Failed to load form");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId && formId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, formId]);

  async function changeStatus(status: string) {
    setSavingStatus(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/forms/${formId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update status");
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this form and all its responses? This can't be undone.")) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/forms/${formId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to delete form");
      router.push(`/workspace/${workspaceId}/forms`);
    } catch (err: any) {
      setError(err?.message || "Failed to delete form");
    }
  }

  const shareUrl = form && typeof window !== "undefined" ? `${window.location.origin}/forms/${form.shareSlug}` : "";

  function copyLink() {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <WorkspaceShell title={form?.title || "Form"} workspaceId={workspaceId}>
      {loading && <p className="text-[13px] text-slate-500">Loading...</p>}
      {error && <p className="text-[13px] text-red-400">{error}</p>}

      {form && (
        <div className="max-w-3xl space-y-6">
          <Card className="p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-lg font-semibold text-white">{form.title}</h1>
                {form.description && <p className="mt-1 text-[13px] text-slate-400">{form.description}</p>}
                {form.grant && <p className="mt-1 text-[12px] text-slate-500">For grant: {form.grant.title}</p>}
              </div>
              <select
                value={form.status}
                disabled={savingStatus}
                onChange={(e) => changeStatus(e.target.value)}
                className="rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              >
                <option value="draft" className="bg-[#0B1B33]">Draft</option>
                <option value="published" className="bg-[#0B1B33]">Published</option>
                <option value="closed" className="bg-[#0B1B33]">Closed</option>
              </select>
            </div>

            {form.status === "draft" && (
              <p className="text-[12px] text-amber-400">
                Publish this form to get a live share link respondents can use.
              </p>
            )}

            {form.status !== "draft" && (
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-slate-300"
                />
                <button
                  onClick={copyLink}
                  className="rounded-md bg-white/[0.06] px-3 py-1.5 text-[12.5px] text-slate-200 hover:bg-white/[0.1]"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
              </div>
            )}

            <button onClick={handleDelete} className="text-[12.5px] text-red-400 hover:underline">
              Delete form
            </button>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
              Fields ({form.fields.length})
            </p>
            <ul className="space-y-2">
              {form.fields.map((f) => (
                <li key={f.id} className="text-[13px] text-slate-300">
                  {f.label} <span className="text-slate-500">({f.type}{f.required ? ", required" : ""})</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <p className="mb-3 text-[12px] font-medium uppercase tracking-wide text-slate-400">
              Responses ({form.responses.length})
            </p>
            {form.responses.length === 0 && (
              <p className="text-[13px] text-slate-500">No responses yet.</p>
            )}
            {form.responses.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-white/[0.08] text-slate-400">
                      <th className="py-2 pr-4">Submitted</th>
                      {form.fields.map((f) => (
                        <th key={f.id} className="py-2 pr-4">{f.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.responses.map((r) => (
                      <tr key={r.id} className="border-b border-white/[0.04] text-slate-300">
                        <td className="py-2 pr-4 whitespace-nowrap text-slate-500">
                          {new Date(r.submittedAt).toLocaleString()}
                        </td>
                        {form.fields.map((f) => (
                          <td key={f.id} className="py-2 pr-4">
                            {String(r.data?.[f.id] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </WorkspaceShell>
  );
}

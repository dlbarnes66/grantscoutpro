"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import { Sparkles, Loader2, Download, Plus, Trash2, CheckCircle2 } from "lucide-react";

interface Section {
  title: string;
  content: string;
}
interface BudgetLineItem {
  category: string;
  description: string;
  amount: number;
}
interface Budget {
  lineItems: BudgetLineItem[];
  total: number;
  notes: string;
}

// Plain-language, one-line explanations for the standard section titles
// (see STANDARD_SECTIONS in src/lib/ai/proposalPackage.ts) so a first-time
// user isn't left guessing what grant-writing jargon like "Methodology" or
// "Evaluation Plan" actually means. Falls back to a generic hint for any
// section title that doesn't match (custom sections, funder-specific ones).
const SECTION_HINTS: Record<string, string> = {
  "Statement of Need": "The problem you're solving - why it matters, who it affects, and why now.",
  "Goals & Objectives": "What success looks like. Goals are the big picture; objectives are specific, measurable steps toward it.",
  "Program Description / Methodology": "How you'll actually do the work - the plan, activities, and timeline.",
  "Evaluation Plan": "How you'll know it worked - what you'll measure and how you'll track it.",
  "Organizational Background": "Who you are - your mission, history, and why your organization is the right one for this.",
  "Budget Narrative": "A plain-English explanation of the numbers in the budget below - why each cost is needed.",
};
const DEFAULT_SECTION_HINT = "Review and edit this section so it reflects your organization in your own words.";

export default function SubmissionPackagePage() {
  const params = useParams() as { workspaceId: string; grantId: string };
  const { workspaceId, grantId } = params;

  const [grantTitle, setGrantTitle] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/package`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load package");
      setGrantTitle(data.grant?.title || "");
      setStatus(data.status);
      setSections(data.sections || []);
      setBudget(data.budget || null);
      setDirty(false);
    } catch (err: any) {
      setError(err?.message || "Failed to load package");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId && grantId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, grantId]);

  // Warn before leaving the page with unsaved edits - the AI-drafted text
  // and budget only live in the database once "Save Draft" (or an
  // auto-save from Download/Mark Ready, below) actually runs.
  useEffect(() => {
    if (!dirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  const isReady = status === "ready";

  async function generate(confirmOverwrite: boolean) {
    if (confirmOverwrite && !confirm("This replaces the current draft sections and budget with a fresh AI-generated version. Continue?")) {
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/package/generate`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate package");
      setStatus(data.status);
      setSections(data.sections || []);
      setBudget(data.budget || null);
      setDirty(false);
    } catch (err: any) {
      setError(err?.message || "Failed to generate package");
    } finally {
      setGenerating(false);
    }
  }

  // Returns true on success, false on failure - so Download and Mark Ready
  // can auto-save first and bail out (with the error already shown) rather
  // than silently proceeding against stale, unsaved content.
  async function save(): Promise<boolean> {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/package/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections, budget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setDirty(false);
      return true;
    } catch (err: any) {
      setError(err?.message || "Failed to save");
      return false;
    } finally {
      setSaving(false);
    }
  }

  // Shared by Download and Mark Ready: both used to read whatever was last
  // saved in the database, so editing a section and then immediately
  // downloading or finalizing silently discarded those edits. Saving first
  // (only when there's something unsaved) makes that impossible.
  async function persistIfDirty(): Promise<boolean> {
    if (!dirty) return true;
    return save();
  }

  async function downloadPackage() {
    setDownloading(true);
    setError(null);
    try {
      const ok = await persistIfDirty();
      if (!ok) return;
      window.location.href = `/api/workspaces/${workspaceId}/grants/${grantId}/package/pdf`;
    } finally {
      setDownloading(false);
    }
  }

  async function finalize() {
    if (!confirm("Mark this package as ready to submit? You can still download it, but it will lock further edits here.")) return;
    setFinalizing(true);
    setError(null);
    try {
      const ok = await persistIfDirty();
      if (!ok) return;
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/package/finalize`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to finalize");
      setStatus(data.status);
    } catch (err: any) {
      setError(err?.message || "Failed to finalize");
    } finally {
      setFinalizing(false);
    }
  }

  function updateSection(index: number, content: string) {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, content } : s)));
    setDirty(true);
  }

  function updateBudgetItem(index: number, field: keyof BudgetLineItem, value: string) {
    setBudget((prev) => {
      if (!prev) return prev;
      const lineItems = prev.lineItems.map((item, i) =>
        i === index ? { ...item, [field]: field === "amount" ? Number(value) || 0 : value } : item
      );
      const total = lineItems.reduce((s, i) => s + i.amount, 0);
      return { ...prev, lineItems, total };
    });
    setDirty(true);
  }

  function addBudgetRow() {
    setBudget((prev) => {
      const lineItems = [...(prev?.lineItems || []), { category: "New item", description: "", amount: 0 }];
      const total = lineItems.reduce((s, i) => s + i.amount, 0);
      return { lineItems, total, notes: prev?.notes || "" };
    });
    setDirty(true);
  }

  function removeBudgetRow(index: number) {
    setBudget((prev) => {
      if (!prev) return prev;
      const lineItems = prev.lineItems.filter((_, i) => i !== index);
      const total = lineItems.reduce((s, i) => s + i.amount, 0);
      return { ...prev, lineItems, total };
    });
    setDirty(true);
  }

  return (
    <WorkspaceShell title="Submission Package" workspaceId={workspaceId}>
      {loading && (
        <div className="flex items-center gap-2 text-slate-500">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      )}

      {!loading && (
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[12.5px] uppercase tracking-wide text-slate-500">Submission Package</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">{grantTitle}</h1>
            </div>
            {status && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[12px] font-medium ${
                  isReady ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {isReady ? "Ready to submit" : dirty ? "Unsaved changes" : "Draft"}
              </span>
            )}
          </div>

          {error && <p className="text-[13px] text-red-400">{error}</p>}

          {sections.length === 0 ? (
            <Card className="p-8 text-center">
              <Sparkles size={20} className="mx-auto mb-3 text-[#00E5FF]" />
              <p className="mb-4 text-[13.5px] text-slate-300">
                Have AI draft a full proposal narrative and budget for this grant, based on your organization's
                profile and current projects.
              </p>
              <button
                onClick={() => generate(false)}
                disabled={generating}
                className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-medium text-[#06131F] disabled:opacity-50"
              >
                {generating && <Loader2 size={13} className="animate-spin" />}
                Build Submission Package with AI
              </button>
            </Card>
          ) : (
            <>
              {isReady && (
                <Card className="flex items-center gap-2 border-emerald-500/20 bg-emerald-500/[0.06] p-4">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <p className="text-[13px] text-emerald-300">
                    This package is finalized. Download it below and submit it through the funder's own application
                    process - Grant Scout Pro doesn't submit to funders directly.
                  </p>
                </Card>
              )}

              {!isReady && (
                <p className="text-[12.5px] text-slate-500">
                  This is a first AI-drafted version - read through each section below and edit it so it sounds like
                  your organization before downloading or marking it ready.
                </p>
              )}

              {sections.map((section, i) => (
                <Card key={i} className="p-5">
                  <p className="text-[13px] font-semibold text-white">{section.title}</p>
                  <p className="mb-2 mt-0.5 text-[12px] text-slate-500">
                    {SECTION_HINTS[section.title] || DEFAULT_SECTION_HINT}
                  </p>
                  <textarea
                    value={section.content}
                    onChange={(e) => updateSection(i, e.target.value)}
                    disabled={isReady}
                    rows={6}
                    className="w-full resize-y rounded-md border border-white/[0.08] bg-white/[0.03] p-3 text-[13px] leading-relaxed text-slate-200 outline-none focus:border-[#00E5FF]/50 disabled:opacity-70"
                  />
                </Card>
              ))}

              {budget && (
                <Card className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold text-white">Budget</p>
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        A first-draft estimate to edit until it reflects your real costs - not a final, audited figure.
                      </p>
                    </div>
                    {!isReady && (
                      <button
                        onClick={addBudgetRow}
                        className="inline-flex shrink-0 items-center gap-1 text-[12.5px] text-[#00E5FF] hover:underline"
                      >
                        <Plus size={13} /> Add line item
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {budget.lineItems.map((item, i) => (
                      <div key={i} className="grid grid-cols-[1fr_2fr_120px_auto] items-center gap-2">
                        <input
                          value={item.category}
                          disabled={isReady}
                          onChange={(e) => updateBudgetItem(i, "category", e.target.value)}
                          className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#00E5FF]/50 disabled:opacity-70"
                        />
                        <input
                          value={item.description}
                          disabled={isReady}
                          onChange={(e) => updateBudgetItem(i, "description", e.target.value)}
                          className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#00E5FF]/50 disabled:opacity-70"
                        />
                        <input
                          type="number"
                          value={item.amount}
                          disabled={isReady}
                          onChange={(e) => updateBudgetItem(i, "amount", e.target.value)}
                          className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-right text-[12.5px] text-white outline-none focus:border-[#00E5FF]/50 disabled:opacity-70"
                        />
                        {!isReady && (
                          <button onClick={() => removeBudgetRow(i)} className="text-slate-500 hover:text-red-400">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3">
                    <span className="text-[12.5px] text-slate-400">Total</span>
                    <span className="text-[14px] font-semibold text-white">
                      ${budget.total.toLocaleString("en-US")}
                    </span>
                  </div>
                  {budget.notes && <p className="mt-2 text-[12px] text-slate-500">{budget.notes}</p>}
                </Card>
              )}

              <div className="flex flex-wrap items-center gap-2.5">
                {!isReady && (
                  <button
                    onClick={save}
                    disabled={saving || !dirty}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3.5 py-2 text-[13px] font-medium text-[#06131F] disabled:opacity-50"
                  >
                    {saving && <Loader2 size={13} className="animate-spin" />}
                    Save Draft
                  </button>
                )}
                <button
                  onClick={downloadPackage}
                  disabled={downloading}
                  className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] px-3.5 py-2 text-[13px] font-medium text-slate-200 hover:bg-white/[0.04] disabled:opacity-50"
                >
                  {downloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={14} />}
                  Download Package PDF
                </button>
                {!isReady && (
                  <>
                    <button
                      onClick={() => generate(true)}
                      disabled={generating}
                      className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] px-3.5 py-2 text-[13px] font-medium text-slate-200 hover:bg-white/[0.04] disabled:opacity-50"
                    >
                      {generating && <Loader2 size={13} className="animate-spin" />}
                      Regenerate with AI
                    </button>
                    <button
                      onClick={finalize}
                      disabled={finalizing}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-3.5 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {finalizing && <Loader2 size={13} className="animate-spin" />}
                      Mark Ready to Submit
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </WorkspaceShell>
  );
}

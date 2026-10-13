"use client";

import { useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import Card from "@/components/ui/Card";
import { Loader2, ListChecks, ShieldCheck, Paperclip, Upload, X, Plus, Trash2, AlertTriangle, Info, XCircle } from "lucide-react";

// ---------- shared types (mirror src/lib/ai/packageChecklist.ts / packageReview.ts) ----------

export interface BudgetExtrasShape {
  total: number;
  indirectRate?: number | null;
  match?: { required: boolean; amount: number; notes: string };
  otherFunding?: { source: string; amount: number; status: string }[];
  cashFlow?: { period: string; inflow: number; outflow: number; notes?: string }[];
}

interface ChecklistItem {
  id: string;
  label: string;
  category: string;
  required: boolean;
  source: "standard" | "funder-text" | "custom";
  detail?: string;
  done: boolean;
  fileIds: string[];
  complete: boolean;
  satisfiedBy: "manual" | "auto" | "attachment" | null;
}
interface ChecklistData {
  generatedAt: string;
  deadline: string | null;
  submissionMethod: string | null;
  notes: string | null;
  items: ChecklistItem[];
}
interface FileRow {
  id: string;
  filename: string;
  size: number;
  url: string;
}
interface Finding {
  severity: "blocker" | "warning" | "info";
  area: string;
  message: string;
  fix?: string;
  source: "check" | "ai";
}
interface ReviewData {
  ranAt: string;
  ready: boolean;
  counts: { blocker: number; warning: number; info: number };
  findings: Finding[];
  aiRan: boolean;
}

const inputCls =
  "rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-[12.5px] text-white outline-none focus:border-[#00E5FF]/50 disabled:opacity-70";
const btnCls =
  "inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] px-3 py-1.5 text-[12.5px] font-medium text-slate-200 hover:bg-white/[0.04] disabled:opacity-50";
const primaryBtn =
  "inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3.5 py-2 text-[13px] font-medium text-[#06131F] disabled:opacity-50";

const CATEGORY_LABELS: Record<string, string> = {
  registration: "Registrations",
  eligibility: "Eligibility",
  form: "Forms",
  narrative: "Narrative sections",
  budget: "Budget",
  attachment: "Supporting documents",
  submission: "Submission",
};
const CATEGORY_ORDER = ["registration", "eligibility", "form", "narrative", "budget", "attachment", "submission"];

function fmtSize(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

// ---------- Budget extras: matching funds, other funding, cash flow ----------

export function BudgetExtras({
  budget,
  disabled,
  onChange,
}: {
  budget: BudgetExtrasShape;
  disabled: boolean;
  onChange: (patch: Partial<BudgetExtrasShape>) => void;
}) {
  const match = budget.match || { required: false, amount: 0, notes: "" };
  const funding = budget.otherFunding || [];
  const cashFlow = budget.cashFlow || [];
  const outflowSum = cashFlow.reduce((s, c) => s + (Number(c.outflow) || 0), 0);

  return (
    <Card className="space-y-5 p-5">
      <div>
        <p className="text-[13px] font-semibold text-white">Matching funds and other funding</p>
        <p className="mt-0.5 text-[12px] text-slate-500">
          Many funders require a match or want to see other sources. Enter only amounts you can document.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-[12.5px] text-slate-300">
            <input
              type="checkbox"
              checked={match.required}
              disabled={disabled}
              onChange={(e) => onChange({ match: { ...match, required: e.target.checked } })}
            />
            Match / cost share required
          </label>
          <input
            type="number"
            placeholder="Match amount"
            value={match.amount || ""}
            disabled={disabled}
            onChange={(e) => onChange({ match: { ...match, amount: Number(e.target.value) || 0 } })}
            className={`${inputCls} w-36 text-right`}
          />
          <input
            placeholder="Where the match comes from"
            value={match.notes}
            disabled={disabled}
            onChange={(e) => onChange({ match: { ...match, notes: e.target.value } })}
            className={`${inputCls} min-w-[220px] flex-1`}
          />
        </div>
        <div className="mt-3 space-y-2">
          {funding.map((f, i) => (
            <div key={i} className="grid grid-cols-[2fr_120px_130px_auto] items-center gap-2">
              <input
                value={f.source}
                disabled={disabled}
                placeholder="Funding source"
                onChange={(e) => onChange({ otherFunding: funding.map((x, j) => (j === i ? { ...x, source: e.target.value } : x)) })}
                className={inputCls}
              />
              <input
                type="number"
                value={f.amount}
                disabled={disabled}
                onChange={(e) => onChange({ otherFunding: funding.map((x, j) => (j === i ? { ...x, amount: Number(e.target.value) || 0 } : x)) })}
                className={`${inputCls} text-right`}
              />
              <select
                value={f.status}
                disabled={disabled}
                onChange={(e) => onChange({ otherFunding: funding.map((x, j) => (j === i ? { ...x, status: e.target.value } : x)) })}
                className={inputCls}
              >
                {["requested", "committed", "in-kind", "projected", "pending"].map((s) => (
                  <option key={s} value={s} className="text-black">
                    {s}
                  </option>
                ))}
              </select>
              {!disabled && (
                <button onClick={() => onChange({ otherFunding: funding.filter((_, j) => j !== i) })} className="text-slate-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {!disabled && (
            <button
              onClick={() => onChange({ otherFunding: [...funding, { source: "", amount: 0, status: "projected" }] })}
              className="inline-flex items-center gap-1 text-[12.5px] text-[#00E5FF] hover:underline"
            >
              <Plus size={13} /> Add funding source
            </button>
          )}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-semibold text-white">Cash-flow plan</p>
        <p className="mt-0.5 text-[12px] text-slate-500">
          When money is expected in and spent out. This matters most if the funder pays by reimbursement.
        </p>
        <div className="mt-3 space-y-2">
          {cashFlow.map((c, i) => (
            <div key={i} className="grid grid-cols-[1.5fr_120px_120px_auto] items-center gap-2">
              <input
                value={c.period}
                disabled={disabled}
                onChange={(e) => onChange({ cashFlow: cashFlow.map((x, j) => (j === i ? { ...x, period: e.target.value } : x)) })}
                className={inputCls}
              />
              <input
                type="number"
                value={c.inflow}
                disabled={disabled}
                title="Expected receipts"
                onChange={(e) => onChange({ cashFlow: cashFlow.map((x, j) => (j === i ? { ...x, inflow: Number(e.target.value) || 0 } : x)) })}
                className={`${inputCls} text-right`}
              />
              <input
                type="number"
                value={c.outflow}
                disabled={disabled}
                title="Spending"
                onChange={(e) => onChange({ cashFlow: cashFlow.map((x, j) => (j === i ? { ...x, outflow: Number(e.target.value) || 0 } : x)) })}
                className={`${inputCls} text-right`}
              />
              {!disabled && (
                <button onClick={() => onChange({ cashFlow: cashFlow.filter((_, j) => j !== i) })} className="text-slate-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          {cashFlow.length > 0 && (
            <p className={`text-[12px] ${Math.abs(outflowSum - budget.total) > Math.max(1, budget.total * 0.01) ? "text-amber-400" : "text-slate-500"}`}>
              Columns: period, expected receipts, spending. Spending totals ${outflowSum.toLocaleString("en-US")} against a budget of $
              {budget.total.toLocaleString("en-US")}.
            </p>
          )}
          {!disabled && (
            <button
              onClick={() => onChange({ cashFlow: [...cashFlow, { period: `Quarter ${cashFlow.length + 1}`, inflow: 0, outflow: 0 }] })}
              className="inline-flex items-center gap-1 text-[12.5px] text-[#00E5FF] hover:underline"
            >
              <Plus size={13} /> Add period
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

// ---------- Checklist and attachments ----------

export function ChecklistPanel({
  workspaceId,
  grantId,
  refreshKey,
}: {
  workspaceId: string;
  grantId: string;
  refreshKey: number;
}) {
  const base = `/api/workspaces/${workspaceId}/grants/${grantId}/package/checklist`;
  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [building, setBuilding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState("");
  const [newRequired, setNewRequired] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(base);
      const data = await res.json();
      if (res.ok) {
        setChecklist(data.checklist);
        setFiles(data.files || []);
      }
    } catch {
      /* leave as-is */
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, grantId, refreshKey]);

  async function build() {
    setBuilding(true);
    setError(null);
    try {
      const res = await fetch(base, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to build the checklist");
      setChecklist(data.checklist);
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err?.message || "Failed to build the checklist");
    } finally {
      setBuilding(false);
    }
  }

  async function saveItems(items: ChecklistItem[]) {
    setError(null);
    try {
      const res = await fetch(base, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            id: i.id,
            done: i.done,
            fileIds: i.fileIds,
            ...(i.source === "custom" ? { source: "custom", label: i.label, category: i.category, required: i.required, detail: i.detail } : {}),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setChecklist(data.checklist);
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err?.message || "Failed to save");
      await load();
    }
  }

  function patch(id: string, fn: (i: ChecklistItem) => ChecklistItem) {
    if (!checklist) return;
    const items = checklist.items.map((i) => (i.id === id ? fn(i) : i));
    setChecklist({ ...checklist, items });
    return saveItems(items);
  }

  async function uploadFor(itemId: string, file: File) {
    setBusyId(itemId);
    setError(null);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: `/api/workspaces/${workspaceId}/files/upload-token`,
      });
      const res = await fetch(`/api/workspaces/${workspaceId}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, mimeType: file.type || blob.contentType, size: file.size, url: blob.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload succeeded but saving the file record failed.");
      const created: FileRow = data.file;
      setFiles((prev) => [created, ...prev]);
      if (checklist) {
        const items = checklist.items.map((i) => (i.id === itemId ? { ...i, fileIds: [...i.fileIds, created.id] } : i));
        setChecklist({ ...checklist, items });
        await saveItems(items);
      }
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setBusyId(null);
    }
  }

  async function addCustom() {
    if (!checklist || !newLabel.trim()) return;
    const item: ChecklistItem = {
      id: `new-${Date.now()}`,
      label: newLabel.trim(),
      category: "attachment",
      required: newRequired,
      source: "custom",
      done: false,
      fileIds: [],
      complete: false,
      satisfiedBy: null,
    };
    setNewLabel("");
    setNewRequired(false);
    await saveItems([...checklist.items, item]);
  }

  const items = checklist?.items || [];
  const required = items.filter((i) => i.required);
  const requiredDone = required.filter((i) => i.complete).length;
  const fileById = new Map(files.map((f) => [f.id, f]));

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
            <ListChecks size={16} className="text-[#00E5FF]" /> Application checklist and supporting documents
          </p>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Everything this funder needs, with your documents attached to each item. Items marked "from listing" were read from the
            posted opportunity, so confirm them against the official notice.
          </p>
        </div>
        {checklist && (
          <button onClick={build} disabled={building} className={btnCls}>
            {building && <Loader2 size={13} className="animate-spin" />} Rebuild
          </button>
        )}
      </div>

      {error && <p className="text-[12.5px] text-red-400">{error}</p>}
      {loading && <Loader2 size={15} className="animate-spin text-slate-500" />}

      {!loading && !checklist && (
        <div className="text-center">
          <button onClick={build} disabled={building} className={primaryBtn}>
            {building && <Loader2 size={13} className="animate-spin" />} Build checklist for this grant
          </button>
        </div>
      )}

      {checklist && (
        <>
          <div className="rounded-md border border-white/[0.08] bg-white/[0.02] p-3 text-[12.5px] text-slate-300">
            <p>
              <span className="font-semibold text-white">{requiredDone}</span> of {required.length} required items complete
              {checklist.deadline && <> · Deadline {checklist.deadline.slice(0, 10)}</>}
              {checklist.submissionMethod && <> · Submit via {checklist.submissionMethod} (from listing)</>}
            </p>
            {checklist.notes && <p className="mt-1 text-slate-400">{checklist.notes} (from listing)</p>}
          </div>

          <input
            ref={fileInput}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.png,.jpg,.jpeg,.webp"
            onChange={(e) => {
              const f = e.target.files?.[0];
              const target = uploadTarget.current;
              e.target.value = "";
              if (f && target) uploadFor(target, f);
            }}
          />

          {CATEGORY_ORDER.map((cat) => {
            const group = items.filter((i) => i.category === cat);
            if (group.length === 0) return null;
            return (
              <div key={cat}>
                <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-slate-500">{CATEGORY_LABELS[cat]}</p>
                <div className="space-y-1.5">
                  {group.map((i) => {
                    const auto = i.satisfiedBy === "auto";
                    const attachedByFile = i.satisfiedBy === "attachment";
                    const canAttach = i.category === "attachment";
                    const unattached = files.filter((f) => !i.fileIds.includes(f.id));
                    return (
                      <div key={i.id} className="rounded-md border border-white/[0.06] p-2.5">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            className="mt-0.5"
                            checked={i.complete}
                            disabled={auto || attachedByFile}
                            onChange={(e) => patch(i.id, (x) => ({ ...x, done: e.target.checked }))}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] text-slate-100">
                              {i.label}{" "}
                              <span className={`ml-1 rounded px-1.5 py-0.5 text-[10.5px] ${i.required ? "bg-amber-500/15 text-amber-300" : "bg-white/[0.06] text-slate-400"}`}>
                                {i.required ? "Required" : "Optional"}
                              </span>
                              {i.source === "funder-text" && (
                                <span className="ml-1 rounded bg-sky-500/15 px-1.5 py-0.5 text-[10.5px] text-sky-300">From listing, verify</span>
                              )}
                              {auto && <span className="ml-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10.5px] text-emerald-300">Done in package</span>}
                            </p>
                            {i.detail && <p className="mt-0.5 text-[12px] text-slate-500">{i.detail}</p>}

                            {i.fileIds.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {i.fileIds.map((fid) => {
                                  const f = fileById.get(fid);
                                  return (
                                    <span key={fid} className="inline-flex items-center gap-1 rounded bg-white/[0.06] px-2 py-0.5 text-[11.5px] text-slate-200">
                                      <Paperclip size={11} />
                                      {f ? (
                                        <a href={f.url} target="_blank" rel="noreferrer" className="hover:underline">
                                          {f.filename}
                                        </a>
                                      ) : (
                                        "file removed"
                                      )}
                                      <button
                                        title="Detach"
                                        onClick={() => patch(i.id, (x) => ({ ...x, fileIds: x.fileIds.filter((y) => y !== fid) }))}
                                        className="text-slate-400 hover:text-red-400"
                                      >
                                        <X size={11} />
                                      </button>
                                    </span>
                                  );
                                })}
                              </div>
                            )}

                            {canAttach && (
                              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                <button
                                  disabled={busyId === i.id}
                                  onClick={() => {
                                    uploadTarget.current = i.id;
                                    fileInput.current?.click();
                                  }}
                                  className="inline-flex items-center gap-1 text-[12px] text-[#00E5FF] hover:underline disabled:opacity-50"
                                >
                                  {busyId === i.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload
                                </button>
                                {unattached.length > 0 && (
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      const fid = e.target.value;
                                      if (fid) patch(i.id, (x) => ({ ...x, fileIds: [...x.fileIds, fid] }));
                                    }}
                                    className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1 text-[12px] text-slate-300"
                                  >
                                    <option value="" className="text-black">
                                      Attach an uploaded file...
                                    </option>
                                    {unattached.map((f) => (
                                      <option key={f.id} value={f.id} className="text-black">
                                        {f.filename} ({fmtSize(f.size)})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>
                            )}
                          </div>
                          {i.source === "custom" && (
                            <button
                              title="Remove item"
                              onClick={() => checklist && saveItems(checklist.items.filter((x) => x.id !== i.id))}
                              className="text-slate-500 hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.08] pt-3">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Add your own item (for example Letter from county commissioner)"
              className={`${inputCls} min-w-[260px] flex-1`}
              maxLength={140}
            />
            <label className="flex items-center gap-1.5 text-[12px] text-slate-400">
              <input type="checkbox" checked={newRequired} onChange={(e) => setNewRequired(e.target.checked)} /> Required
            </label>
            <button onClick={addCustom} disabled={!newLabel.trim()} className={btnCls}>
              <Plus size={13} /> Add
            </button>
          </div>
        </>
      )}
    </Card>
  );
}

// ---------- Compliance and consistency review ----------

const SEVERITY_STYLE: Record<Finding["severity"], { cls: string; label: string }> = {
  blocker: { cls: "bg-red-500/15 text-red-300", label: "Blocker" },
  warning: { cls: "bg-amber-500/15 text-amber-300", label: "Warning" },
  info: { cls: "bg-sky-500/15 text-sky-300", label: "Note" },
};

export function ReviewPanel({
  workspaceId,
  grantId,
  dirty,
  persist,
  onReviewed,
}: {
  workspaceId: string;
  grantId: string;
  dirty: boolean;
  persist: () => Promise<boolean>;
  onReviewed: () => void;
}) {
  const base = `/api/workspaces/${workspaceId}/grants/${grantId}/package/review`;
  const [review, setReview] = useState<ReviewData | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(base);
        const data = await res.json();
        if (res.ok) setReview(data.review);
      } catch {
        /* ignore */
      }
    })();
  }, [base]);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      // The review reads the saved draft, so save pending edits first.
      if (!(await persist())) return;
      const res = await fetch(base, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Review failed");
      setReview(data.review);
      onReviewed();
    } catch (err: any) {
      setError(err?.message || "Review failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[14px] font-semibold text-white">
            <ShieldCheck size={16} className="text-[#00E5FF]" /> Final compliance and consistency review
          </p>
          <p className="mt-0.5 text-[12px] text-slate-500">
            Checks the narrative, budget, checklist and attachments against each other and the funder's posted criteria. Blockers come
            from hard checks (missing sections, budget math, missing required documents, deadline). The AI cross-check can only add
            warnings and notes. It is a safety net, not a guarantee, so still read the funder's official instructions.
          </p>
        </div>
        <button onClick={run} disabled={running} className={primaryBtn}>
          {running && <Loader2 size={13} className="animate-spin" />} {review ? "Run again" : "Run review"}
        </button>
      </div>

      {dirty && <p className="text-[12px] text-amber-400">You have unsaved edits. Running the review saves them first.</p>}
      {error && <p className="text-[12.5px] text-red-400">{error}</p>}

      {review && (
        <>
          <div
            className={`rounded-md border p-3 text-[13px] ${
              review.ready ? "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300" : "border-red-500/25 bg-red-500/[0.06] text-red-300"
            }`}
          >
            {review.ready
              ? `No blockers found. ${review.counts.warning} warning${review.counts.warning === 1 ? "" : "s"} and ${review.counts.info} note${review.counts.info === 1 ? "" : "s"} to look at before you submit.`
              : `${review.counts.blocker} blocker${review.counts.blocker === 1 ? "" : "s"} to fix before this package is ready.`}
            <span className="ml-2 text-[11.5px] text-slate-400">
              Run {new Date(review.ranAt).toLocaleString()}
              {!review.aiRan && " · AI cross-check was unavailable"}
            </span>
          </div>
          <div className="space-y-2">
            {review.findings.map((f, i) => {
              const s = SEVERITY_STYLE[f.severity];
              const Icon = f.severity === "blocker" ? XCircle : f.severity === "warning" ? AlertTriangle : Info;
              return (
                <div key={i} className="flex gap-2.5 rounded-md border border-white/[0.06] p-2.5">
                  <Icon size={15} className="mt-0.5 shrink-0 text-slate-400" />
                  <div className="min-w-0 text-[12.5px]">
                    <p className="text-slate-100">
                      <span className={`mr-2 rounded px-1.5 py-0.5 text-[10.5px] ${s.cls}`}>{s.label}</span>
                      <span className="mr-2 text-[11px] uppercase tracking-wide text-slate-500">{f.area}{f.source === "ai" ? " · AI" : ""}</span>
                      {f.message}
                    </p>
                    {f.fix && <p className="mt-0.5 text-slate-500">Fix: {f.fix}</p>}
                  </div>
                </div>
              );
            })}
            {review.findings.length === 0 && <p className="text-[12.5px] text-slate-400">Nothing flagged.</p>}
          </div>
        </>
      )}
    </Card>
  );
}

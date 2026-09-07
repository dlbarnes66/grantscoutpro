"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, X, Loader2 } from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import CrmUpgradePrompt from "@/components/crm/CrmUpgradePrompt";

interface Contact {
  id: string;
  name: string;
  email: string | null;
  organization: string | null;
}

interface Deal {
  id: string;
  title: string;
  organization: string | null;
  stage: string;
  amount: number | null;
  contact: Contact | null;
  createdAt: string;
  updatedAt: string;
  _count?: { notes: number };
}

interface Column {
  id: string;
  label: string;
  deals: Deal[];
}

interface Note {
  id: string;
  body: string;
  createdAt: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

function formatMoney(n: number | null) {
  if (n === null || n === undefined) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function CrmPipelinePage() {
  const { workspaceId } = useParams() as { workspaceId: string };

  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsUpgrade, setNeedsUpgrade] = useState(false);

  const [showNewDeal, setShowNewDeal] = useState(false);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  async function loadPipeline() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/pipeline?workspaceId=${workspaceId}`);
      const json = await res.json();
      if (res.status === 402) {
        setNeedsUpgrade(true);
        return;
      }
      if (!res.ok) throw new Error(json?.error || "Failed to load pipeline");
      setColumns(json.columns || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId) loadPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const totalDeals = useMemo(() => columns.reduce((sum, c) => sum + c.deals.length, 0), [columns]);

  if (!loading && needsUpgrade) {
    return (
      <WorkspaceShell title="CRM Pipeline" workspaceId={workspaceId}>
        <CrmUpgradePrompt workspaceId={workspaceId} />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="CRM Pipeline" workspaceId={workspaceId}>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[13px] text-slate-500">
          Track funders and donors from first contact through award.{" "}
          {!loading && `${totalDeals} deal${totalDeals === 1 ? "" : "s"} tracked.`}
        </p>
        <button
          onClick={() => setShowNewDeal(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3 py-1.5 text-[13px] font-medium text-[#06131F] transition-opacity hover:opacity-90"
        >
          <Plus size={14} />
          New Deal
        </button>
      </div>

      {error && <p className="mb-4 text-[13px] text-red-400">{error}</p>}

      {loading ? (
        <p className="text-[13px] text-slate-500">Loading pipeline...</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {columns.map((column) => (
            <div key={column.id} className="w-64 shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <h3 className="text-[12px] font-medium uppercase tracking-wide text-slate-400">
                  {column.label}
                </h3>
                <span className="text-[11.5px] text-slate-500">{column.deals.length}</span>
              </div>

              <div className="flex flex-col gap-2">
                {column.deals.map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => setSelectedDealId(deal.id)}
                    className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 text-left transition-colors hover:border-white/[0.14] hover:bg-white/[0.04]"
                  >
                    <p className="truncate text-[13px] font-medium text-white">{deal.title}</p>
                    {deal.organization && (
                      <p className="mt-0.5 truncate text-[11.5px] text-slate-500">{deal.organization}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      {deal.amount ? (
                        <span className="text-[11.5px] text-[#00E5FF]">{formatMoney(deal.amount)}</span>
                      ) : (
                        <span />
                      )}
                      {!!deal._count?.notes && (
                        <span className="text-[11px] text-slate-500">{deal._count.notes} note{deal._count.notes === 1 ? "" : "s"}</span>
                      )}
                    </div>
                  </button>
                ))}

                {column.deals.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/[0.06] p-3 text-center text-[11.5px] text-slate-600">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewDeal && (
        <NewDealModal
          workspaceId={workspaceId}
          onClose={() => setShowNewDeal(false)}
          onCreated={() => {
            setShowNewDeal(false);
            loadPipeline();
          }}
        />
      )}

      {selectedDealId && (
        <DealDrawer
          workspaceId={workspaceId}
          dealId={selectedDealId}
          onClose={() => setSelectedDealId(null)}
          onChanged={loadPipeline}
        />
      )}
    </WorkspaceShell>
  );
}

const STAGE_OPTIONS = [
  { id: "lead", label: "Lead" },
  { id: "contacted", label: "Contacted" },
  { id: "pipeline", label: "In Pipeline" },
  { id: "negotiating", label: "Negotiating" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

function ModalShell({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div
        className={`w-full ${wide ? "max-w-xl" : "max-w-md"} rounded-xl border border-white/[0.08] bg-[#0B1B33] p-6 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function NewDealModal({
  workspaceId,
  onClose,
  onCreated,
}: {
  workspaceId: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState("lead");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/crm/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: title.trim(),
          organization: organization.trim() || undefined,
          amount: amount ? Number(amount) : undefined,
          stage,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to create deal");
      onCreated();
    } catch (err: any) {
      setError(err?.message || "Failed to create deal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalShell title="New Deal" onClose={onClose}>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-[12px] text-slate-400">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Community Foundation - Housing Grant"
            className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          />
        </div>
        <div>
          <label className="mb-1 block text-[12px] text-slate-400">Organization</label>
          <input
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Funder or donor organization"
            className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[12px] text-slate-400">Amount ($)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-slate-400">Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
            >
              {STAGE_OPTIONS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0B1B33]">
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-[12.5px] text-red-400">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-[13px] text-slate-400 hover:text-white">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#00E5FF] px-3 py-1.5 text-[13px] font-medium text-[#06131F] disabled:opacity-50"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Create Deal
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DealDrawer({
  workspaceId,
  dealId,
  onClose,
  onChanged,
}: {
  workspaceId: string;
  dealId: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [deal, setDeal] = useState<(Deal & { notes: Note[]; activity: Activity[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingStage, setSavingStage] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/crm/deals/${dealId}?workspaceId=${workspaceId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load deal");
      setDeal(json.deal);
    } catch (err: any) {
      setError(err?.message || "Failed to load deal");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealId]);

  async function changeStage(stage: string) {
    if (!deal) return;
    setSavingStage(true);
    try {
      const res = await fetch(`/api/crm/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, stage }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update stage");
      await load();
      onChanged();
    } catch (err: any) {
      setError(err?.message || "Failed to update stage");
    } finally {
      setSavingStage(false);
    }
  }

  async function addNote() {
    if (!noteText.trim()) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/crm/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, dealId, body: noteText.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to add note");
      setNoteText("");
      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to add note");
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col border-l border-white/[0.08] bg-[#0B1B33] p-6 overflow-y-auto">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {deal ? (
              <>
                <h2 className="truncate text-[15px] font-semibold text-white">{deal.title}</h2>
                {deal.organization && <p className="text-[12.5px] text-slate-500">{deal.organization}</p>}
              </>
            ) : (
              <h2 className="text-[15px] font-semibold text-white">Deal</h2>
            )}
          </div>
          <button onClick={onClose} className="shrink-0 text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {loading && <p className="text-[13px] text-slate-500">Loading...</p>}
        {error && <p className="text-[12.5px] text-red-400">{error}</p>}

        {deal && (
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">Stage</label>
              <select
                value={deal.stage}
                disabled={savingStage}
                onChange={(e) => changeStage(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              >
                {STAGE_OPTIONS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0B1B33]">
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {deal.amount != null && (
              <p className="text-[13px] text-slate-300">
                Amount: <span className="text-[#00E5FF]">{formatMoney(deal.amount)}</span>
              </p>
            )}

            {deal.contact && (
              <Card className="p-3">
                <p className="text-[12px] text-slate-500">Contact</p>
                <p className="text-[13px] text-white">{deal.contact.name}</p>
                {deal.contact.email && <p className="text-[12px] text-slate-500">{deal.contact.email}</p>}
              </Card>
            )}

            <div>
              <h3 className="mb-2 text-[12.5px] font-medium text-slate-300">Notes</h3>
              <div className="mb-2 flex gap-2">
                <input
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="Add a note..."
                  className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
                />
                <button
                  onClick={addNote}
                  disabled={savingNote}
                  className="rounded-md bg-white/[0.06] px-3 py-2 text-[12.5px] text-slate-200 hover:bg-white/[0.1] disabled:opacity-50"
                >
                  Add
                </button>
              </div>
              <ul className="divide-y divide-white/[0.06]">
                {deal.notes.length === 0 && <p className="py-2 text-[12.5px] text-slate-600">No notes yet.</p>}
                {deal.notes.map((note) => (
                  <li key={note.id} className="py-2">
                    <p className="text-[13px] text-slate-300">{note.body}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 text-[12.5px] font-medium text-slate-300">Activity</h3>
              <ul className="divide-y divide-white/[0.06]">
                {deal.activity.length === 0 && <p className="py-2 text-[12.5px] text-slate-600">No activity yet.</p>}
                {deal.activity.map((a) => (
                  <li key={a.id} className="py-2">
                    <p className="text-[12.5px] text-slate-400">{a.description}</p>
                    <p className="mt-0.5 text-[11px] text-slate-600">{new Date(a.createdAt).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

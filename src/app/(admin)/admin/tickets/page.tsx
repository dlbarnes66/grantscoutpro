"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Fragment, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface Ticket {
  id: string;
  type: string;
  subject: string;
  description: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  workspace: { id: string; name: string };
  org: { id: string; name: string } | null;
  submittedBy: { id: string; name: string | null; email: string | null };
}

const STATUSES = ["open", "in_progress", "resolved"] as const;

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/tickets");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setTickets(Array.isArray(json.tickets) ? json.tickets : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateTicket(id: string, data: { status?: string; adminNotes?: string }) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to update ticket");
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, ...json.ticket } : t)));
    } catch (err: any) {
      setError(err?.message || "Failed to update ticket");
    } finally {
      setSavingId(null);
    }
  }

  const statusColor: Record<string, string> = {
    open: "text-amber-400",
    in_progress: "text-[#00E5FF]",
    resolved: "text-emerald-400",
  };

  return (
    <div className="min-h-screen bg-[#0A1A2F] p-6 text-white">
      <h1 className="text-2xl font-bold">Tickets</h1>
      <p className="mt-1 text-[13px] text-slate-400">
        Problems and suggestions submitted by workspace owners/admins. Click a row to see the full description and
        leave internal notes.
      </p>

      {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-slate-400">
          <Loader2 size={16} className="animate-spin" /> Loading...
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-white/[0.08]">
          <table className="w-full border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.03] text-slate-400">
                <th className="px-3 py-2 font-medium">Workspace</th>
                <th className="px-3 py-2 font-medium">Submitted By</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Subject</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Filed</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => {
                const expanded = expandedId === t.id;
                return (
                  <Fragment key={t.id}>
                    <tr
                      onClick={() => setExpandedId(expanded ? null : t.id)}
                      className="cursor-pointer border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]"
                    >
                      <td className="px-3 py-2">{t.workspace?.name || "—"}</td>
                      <td className="px-3 py-2 text-slate-400">
                        {t.submittedBy?.name || t.submittedBy?.email || "—"}
                      </td>
                      <td className="px-3 py-2 capitalize">{t.type}</td>
                      <td className="px-3 py-2">{t.subject}</td>
                      <td className={`px-3 py-2 capitalize ${statusColor[t.status] || ""}`}>
                        {t.status.replace("_", " ")}
                      </td>
                      <td className="px-3 py-2 text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    </tr>
                    {expanded && (
                      <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                        <td colSpan={6} className="px-3 py-4">
                          <p className="whitespace-pre-wrap text-slate-300">{t.description}</p>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <label className="text-[12px] text-slate-400">Status</label>
                            <select
                              value={t.status}
                              disabled={savingId === t.id}
                              onChange={(e) => updateTicket(t.id, { status: e.target.value })}
                              className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-[13px] text-white"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s.replace("_", " ")}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="mt-3 space-y-1.5">
                            <label className="text-[12px] text-slate-400">Internal notes</label>
                            <textarea
                              rows={3}
                              value={notesDraft[t.id] ?? t.adminNotes ?? ""}
                              onChange={(e) => setNotesDraft((prev) => ({ ...prev, [t.id]: e.target.value }))}
                              className="w-full rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2 text-[13px] text-white"
                            />
                            <button
                              onClick={() => updateTicket(t.id, { adminNotes: notesDraft[t.id] ?? t.adminNotes ?? "" })}
                              disabled={savingId === t.id}
                              className="rounded-md bg-[#00E5FF] px-3 py-1.5 text-[12px] font-medium text-[#0A1A2F] disabled:opacity-50"
                            >
                              Save Notes
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-500">
                    No tickets filed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

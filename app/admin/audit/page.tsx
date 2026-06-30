"use client";

import { useEffect, useState } from "react";
import { AuditFilters } from "@/components/audit/AuditFilters";
import { AuditTable } from "@/components/audit/AuditTable";
import { AuditDetailDrawer } from "@/components/audit/AuditDetailDrawer";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real backend integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setLogs([
        {
          id: "1",
          actor: "Darryl Barnes",
          action: "Updated narrative section",
          resource: "Narrative: Project Overview",
          timestamp: "2026-06-30 11:45",
          severity: "info",
          ip: "172.16.22.14",
          metadata: { section: "overview", changes: 12 }
        },
        {
          id: "2",
          actor: "Alex Johnson",
          action: "Modified budget line item",
          resource: "Budget: Personnel",
          timestamp: "2026-06-30 11:20",
          severity: "warning",
          ip: "172.16.22.88",
          metadata: { field: "amount", old: 45000, new: 47000 }
        },
        {
          id: "3",
          actor: "System",
          action: "AI risk analysis generated",
          resource: "Risk Dashboard",
          timestamp: "2026-06-30 10:55",
          severity: "system",
          ip: "127.0.0.1",
          metadata: { score: 72 }
        }
      ]);

      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return <div className="text-slate-400">Loading audit logs...</div>;

  const filtered =
    filter === "all" ? logs : logs.filter((l) => l.severity === filter);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Audit Log
      </h1>

      {/* Filters */}
      <AuditFilters filter={filter} onChange={setFilter} />

      {/* Export Button */}
      <div className="flex justify-end">
        <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
          Export Logs
        </button>
      </div>

      {/* Table */}
      <AuditTable logs={filtered} onSelect={setSelected} />

      {/* Drawer */}
      {selected && (
        <AuditDetailDrawer log={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

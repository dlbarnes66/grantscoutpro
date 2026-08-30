"use client";

import { useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import AuditFilterControls from "@/components/admin/AuditFilterControls";
import AuditLogList from "@/components/admin/AuditLogList";
import AuditLogDetails from "@/components/admin/AuditLogDetails";

export interface AuditFilter {
  userId?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: string;
}

export default function AdminAuditPage() {
  const [filter, setFilter] = useState<AuditFilter>({});
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  function handleFilterChange(next: AuditFilter) {
    setFilter(next);
    // TODO: fetch logs with new filter
  }

  function handleSelectLog(log: AuditLog) {
    setSelectedLog(log);
  }

  function handleCloseDetails() {
    setSelectedLog(null);
  }

  return (
    <AdminShell title="Audit Logs">
      <div className="space-y-6">
        <AuditFilterControls
          filter={filter}
          onChangeAction={handleFilterChange}
        />

        <AuditLogList logs={logs} onSelectAction={handleSelectLog} />

        {selectedLog && (
          <AuditLogDetails
            log={selectedLog}
            onCloseAction={handleCloseDetails}
          />
        )}
      </div>
    </AdminShell>
  );
}

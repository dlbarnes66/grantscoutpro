"use client";

import React from "react";
import { AuditLog } from "@/app/admin/audit/page";

export default function AuditLogList({
  logs,
  onSelectAction,
}: {
  logs: AuditLog[];
  onSelectAction: (l: AuditLog) => void;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      {logs.length === 0 && (
        <p className="text-sm text-slate-400">No audit logs.</p>
      )}
      {logs.map((log) => (
        <div
          key={log.id}
          className="cursor-pointer text-sm text-slate-200"
          onClick={() => onSelectAction(log)}
        >
          {log.timestamp} — {log.userId} — {log.action}
        </div>
      ))}
    </div>
  );
}

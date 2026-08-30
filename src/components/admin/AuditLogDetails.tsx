"use client";

import React from "react";
import { AuditLog } from "@/app/admin/audit/page";

export default function AuditLogDetails({
  log,
  onCloseAction,
}: {
  log: AuditLog;
  onCloseAction: () => void;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Log details</h2>
        <button
          className="text-xs text-slate-400"
          onClick={onCloseAction}
        >
          Close
        </button>
      </div>
      <pre className="text-xs text-slate-200 whitespace-pre-wrap">
        {JSON.stringify(log, null, 2)}
      </pre>
    </div>
  );
}

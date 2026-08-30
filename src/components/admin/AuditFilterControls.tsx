"use client";

import React from "react";
import { AuditFilter } from "@/app/admin/audit/page";

export default function AuditFilterControls({
  filter,
  onChangeAction,
}: {
  filter: AuditFilter;
  onChangeAction: (f: AuditFilter) => void;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      <p className="text-sm text-slate-400">Audit filter controls go here.</p>
    </div>
  );
}

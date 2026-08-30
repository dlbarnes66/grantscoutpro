"use client";

import React from "react";
import Card from "@/components/ui/Card";

export default function WorkspaceMultiLocationSettings({
  workspaceId,
}: {
  workspaceId: string;
}) {
  return (
    <Card className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">Additional Locations</h2>

      <p className="text-slate-300">
        Manage multiple locations for workspace <strong>{workspaceId}</strong>.
      </p>

      <p className="text-slate-400 text-sm">
        Multi‑location management UI will appear here.
      </p>
    </Card>
  );
}

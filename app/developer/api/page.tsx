"use client";

import { useState } from "react";
import { APIKeyViewer } from "@/components/developer/APIKeyViewer";
import { APIPlayground } from "@/components/developer/APIPlayground";
import { APIRateLimits } from "@/components/developer/APIRateLimits";
import { APILogViewer } from "@/components/developer/APILogViewer";

export default function DeveloperAPIPage() {
  const [logs, setLogs] = useState<any[]>([]);

  function addLog(entry: any) {
    setLogs((prev) => [entry, ...prev]);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Developer API Console
      </h1>

      <APIKeyViewer />

      <APIPlayground onLog={addLog} />

      <APIRateLimits />

      <APILogViewer logs={logs} />
    </div>
  );
}

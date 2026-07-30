"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import WebhookList from "@/components/webhooks/WebhookList";
import WebhookCreate from "@/components/webhooks/WebhookCreate";
import WebhookTester from "@/components/webhooks/WebhookTester";
import WebhookLogs from "@/components/webhooks/WebhookLogs";
import WebhookSecret from "@/components/webhooks/WebhookSecret";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  function addWebhook(w: any) {
    setWebhooks((prev) => [...prev, w]);
  }

  function addLog(entry: any) {
    setLogs((prev) => [entry, ...prev]);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Webhooks Manager
      </h1>

      <WebhookSecret />

      <WebhookCreate onCreate={addWebhook} />

      <WebhookList webhooks={webhooks} />

      <WebhookTester webhooks={webhooks} onLog={addLog} />

      <WebhookLogs logs={logs} />
    </div>
  );
}

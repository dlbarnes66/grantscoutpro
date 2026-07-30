"use client";

import { useState } from "react";
import { Webhook, WebhookLogEntry } from "./types";

export default function WebhookTester({
  webhooks,
  onLog,
}: {
  webhooks: Webhook[];
  onLog: (entry: WebhookLogEntry) => void;
}) {
  const [payload, setPayload] = useState('{ "test": true }');

  function send(w: Webhook) {
    const fakeDelivery: WebhookLogEntry = {
      webhookId: w.id,
      url: w.url,
      event: w.event,
      payload,
      status: 200,
      timestamp: new Date().toISOString(),
    };

    onLog(fakeDelivery);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Test Webhook Delivery
      </h2>

      <textarea
        value={payload}
        onChange={(e) => setPayload(e.target.value)}
        className="w-full h-32 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      />

      {webhooks.length === 0 && (
        <div className="text-slate-400 text-sm">No webhooks to test.</div>
      )}

      <ul className="space-y-3 text-sm text-slate-300">
        {webhooks.map((w) => (
          <li key={w.id} className="flex items-center justify-between">
            <span>{w.url}</span>
            <button
              onClick={() => send(w)}
              className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-xs font-medium"
            >
              Send Test
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

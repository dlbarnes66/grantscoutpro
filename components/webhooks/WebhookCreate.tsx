"use client";

import { useState } from "react";
import { Webhook } from "./types";

export default function WebhookCreate({
  onCreateAction
}: {
  onCreateAction: (w: Webhook) => void;
}) {
  const [url, setUrl] = useState("");
  const [event, setEvent] = useState("grant.updated");

  function create() {
    if (!url) return;

    const webhook: Webhook = {
      id: crypto.randomUUID(),
      url,
      event,
      created: new Date().toISOString()
    };

    onCreateAction(webhook);
    setUrl("");
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">Create Webhook</h2>

      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/webhook"
        className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      />

      <select
        value={event}
        onChange={(e) => setEvent(e.target.value)}
        className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      >
        <option value="grant.updated">grant.updated</option>
        <option value="grant.created">grant.created</option>
        <option value="report.submitted">report.submitted</option>
        <option value="ai.generated">ai.generated</option>
      </select>

      <button
        onClick={create}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
      >
        Create Webhook
      </button>
    </div>
  );
}

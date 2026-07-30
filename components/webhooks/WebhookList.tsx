"use client";

import { Webhook } from "./types";

export default function WebhookList({
  webhooks,
}: {
  webhooks: Webhook[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">Webhooks</h2>

      {webhooks.length === 0 && (
        <div className="text-slate-400 text-sm">No webhooks created yet.</div>
      )}

      <ul className="space-y-4 text-sm text-slate-300">
        {webhooks.map((w) => (
          <li key={w.id} className="rounded-lg bg-slate-800 p-4 space-y-1">
            <div className="font-semibold text-slate-100">{w.url}</div>
            <div>Event: {w.event}</div>
            <div className="text-xs text-slate-500">Created: {w.created}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

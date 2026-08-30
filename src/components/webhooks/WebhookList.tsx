"use client"

import React from "react";

export default function WebhookList({
  webhooks = [],
}: {
  webhooks?: Array<{ id: string; url: string; status: string }>;
}) {
  return (
    <div className="space-y-4 border p-4 rounded bg-gray-50">
      <h3 className="font-semibold text-lg">Webhooks</h3>

      {webhooks.length === 0 && (
        <p className="text-sm text-gray-600">No webhooks configured.</p>
      )}

      {webhooks.map((hook) => (
        <div key={hook.id} className="border p-3 rounded bg-white">
          <p className="font-medium">{hook.url}</p>
          <p className="text-sm text-gray-600">Status: {hook.status}</p>
        </div>
      ))}
    </div>
  );
}

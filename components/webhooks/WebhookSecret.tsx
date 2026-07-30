"use client";

import { useState } from "react";

export default function WebhookSecret() {
  const [secret, setSecret] = useState("whsec_123456789");

  function regenerate() {
    setSecret("whsec_" + crypto.randomUUID());
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Webhook Signing Secret
      </h2>

      <div className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-300">
        {secret}
      </div>

      <button
        onClick={regenerate}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
      >
        Regenerate Secret
      </button>
    </div>
  );
}

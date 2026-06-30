"use client";

import { useState } from "react";

export function APIKeyViewer() {
  const [key, setKey] = useState("sk_live_123456789");

  function regenerate() {
    setKey("sk_live_" + crypto.randomUUID());
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        API Key
      </h2>

      <div className="rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-300">
        {key}
      </div>

      <button
        onClick={regenerate}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
      >
        Regenerate Key
      </button>
    </div>
  );
}

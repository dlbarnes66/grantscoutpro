"use client";

import { useState } from "react";

export default function RenewalNarrative() {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Renewal Narrative
      </h2>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write your renewal narrative..."
        className="w-full h-48 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      />

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Save Narrative
      </button>
    </div>
  );
}

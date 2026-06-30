"use client";

import { useState } from "react";

export function FinalReportPanel() {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Final Report
      </h2>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write your final project report..."
        className="w-full h-48 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      />

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Save Final Report
      </button>
    </div>
  );
}

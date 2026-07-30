"use client";

import { GrantMetaData } from "./types";

export function GrantMeta({ grant }: { grant: GrantMetaData }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Grant Overview
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <div className="text-slate-400">Amount</div>
          <div className="font-semibold text-slate-100">
            ${grant.amount.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Deadline</div>
          <div className="font-semibold text-slate-100">
            {grant.deadline}
          </div>
        </div>

        <div>
          <div className="text-slate-400">Category</div>
          <div className="font-semibold text-slate-100">
            {grant.category}
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-300">{grant.description}</p>

      <div className="text-xs text-slate-400">
        AI Match Score:
        <span className="ml-1 font-semibold text-slate-100">
          {grant.matchScore}%
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-4 py-2 text-sm font-medium">
          Start Narrative
        </button>

        <button className="rounded-md bg-slate-800 hover:bg-slate-700 transition px-4 py-2 text-sm font-medium">
          Add to Pipeline
        </button>
      </div>
    </div>
  );
}

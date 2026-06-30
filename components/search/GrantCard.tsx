"use client";

import { BookmarkIcon } from "@heroicons/react/24/outline";

export function GrantCard({ grant }: { grant: any }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-3 hover:bg-slate-800 transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            {grant.title}
          </h3>
          <p className="text-xs text-slate-400">{grant.funder}</p>
        </div>

        <button className="rounded-md p-1 hover:bg-slate-700 transition">
          <BookmarkIcon className="h-5 w-5 text-slate-300" />
        </button>
      </div>

      <div className="text-sm text-slate-300">
        <div>Amount: ${grant.amount.toLocaleString()}</div>
        <div>Deadline: {grant.deadline}</div>
      </div>

      <div className="text-xs text-slate-400">
        AI Match Score:
        <span className="ml-1 font-semibold text-slate-100">
          {grant.matchScore}%
        </span>
      </div>

      <button className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        View Details
      </button>
    </div>
  );
}

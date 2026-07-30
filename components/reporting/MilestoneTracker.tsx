"use client";

import { MilestoneItem } from "./types";

export default function MilestoneTracker({
  milestones
}: {
  milestones: MilestoneItem[];
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Milestone Tracker
      </h2>

      <ul className="space-y-3 text-sm">
        {milestones.map((m) => (
          <li key={m.id} className="flex items-center justify-between">
            <span className="text-slate-300">{m.label}</span>
            <span className="text-slate-400">{m.date}</span>
            <span
              className={
                m.done
                  ? "text-green-400 font-semibold"
                  : "text-yellow-400 font-semibold"
              }
            >
              {m.done ? "Completed" : "Pending"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

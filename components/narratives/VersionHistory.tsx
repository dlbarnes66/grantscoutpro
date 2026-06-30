"use client";

export function VersionHistory({ section }: { section: any }) {
  const versions = [
    { id: 1, timestamp: "2026-06-30 09:15", summary: "Initial draft" },
    { id: 2, timestamp: "2026-06-30 09:45", summary: "Added impact details" }
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Version History
      </h2>

      <ul className="space-y-3 text-sm text-slate-300">
        {versions.map((v) => (
          <li key={v.id}>
            <div className="font-semibold text-slate-100">{v.summary}</div>
            <div className="text-xs text-slate-400">{v.timestamp}</div>
          </li>
        ))}
      </ul>

      <button className="w-full rounded-md bg-slate-800 hover:bg-slate-700 transition px-3 py-2 text-sm font-medium">
        Restore Version
      </button>
    </div>
  );
}

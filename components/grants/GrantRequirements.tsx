"use client";

export function GrantRequirements({ requirements }: { requirements: string[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Requirements
      </h2>

      <ul className="space-y-2 text-sm text-slate-300">
        {requirements.map((req, i) => (
          <li key={i}>• {req}</li>
        ))}
      </ul>
    </div>
  );
}

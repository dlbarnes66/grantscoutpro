"use client";

export default function ProgramHealthScore({ score }: { score: number }) {
  const color =
    score < 40
      ? "text-red-400"
      : score < 70
      ? "text-yellow-400"
      : "text-green-400";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center space-y-3">
      <div className="text-sm font-semibold text-slate-100">
        Program Health Score
      </div>

      <div className={`text-5xl font-bold ${color}`}>{score}%</div>

      <p className="text-sm text-slate-400">
        Based on KPIs, milestones, compliance, and outcome progress.
      </p>
    </div>
  );
}

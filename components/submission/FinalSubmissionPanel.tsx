"use client";

export function FinalSubmissionPanel() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Final Submission
      </h2>

      <p className="text-sm text-slate-300">
        Review all sections carefully before submitting. Once submitted, changes may not be allowed.
      </p>

      <button className="w-full rounded-md bg-green-600 hover:bg-green-700 transition px-3 py-2 text-sm font-medium">
        Submit Application
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";

export function HelpHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Help Center</h1>
        <p className="text-slate-400 text-sm">
          Find answers, guidance, and tips for using GrantScout Pro.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

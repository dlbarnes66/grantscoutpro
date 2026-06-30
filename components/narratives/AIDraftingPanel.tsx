"use client";

import { SparklesIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export function AIDraftingPanel({
  section,
  onDraft
}: {
  section: any;
  onDraft: (draft: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function generateDraft() {
    setLoading(true);

    // Placeholder — real AI integration comes later
    await new Promise((r) => setTimeout(r, 800));

    const draft = `This is an AI-generated draft for the ${section.title}. It provides a structured, compelling narrative aligned with funder expectations.`;

    onDraft(draft);
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-5 w-5 text-blue-400" />
        <h2 className="text-sm font-semibold text-slate-100">
          AI Drafting
        </h2>
      </div>

      <p className="text-sm text-slate-400">
        Generate a draft for this section using AI.
      </p>

      <button
        onClick={generateDraft}
        disabled={loading}
        className="w-full rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Draft"}
      </button>
    </div>
  );
}

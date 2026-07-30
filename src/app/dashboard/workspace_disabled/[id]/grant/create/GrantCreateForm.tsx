"use client";

import { useState } from "react";

export default function GrantCreateForm({
  workspaceId
}: {
  workspaceId: string;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdGrantId, setCreatedGrantId] = useState<string | null>(null);

  async function createGrant() {
    setCreating(true);

    const res = await fetch("/api/grants/create", {
      method: "POST",
      body: JSON.stringify({
        workspaceId,
        title,
        summary,
        useAI
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (data.success) {
      setCreatedGrantId(data.grant.id);
    }
  }

  if (createdGrantId) {
    return (
      <div className="p-4 border rounded-md bg-green-50">
        <h2 className="text-xl font-semibold">Grant Created Successfully</h2>
        <p className="mt-2">Your grant has been created.</p>

        <a
          href={`/dashboard/workspace/${workspaceId}/grant/${createdGrantId}`}
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Open Grant Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <div className="space-y-2">
        <label className="font-medium">Grant Title</label>
        <input
          type="text"
          className="w-full p-3 border rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Community Development Block Grant"
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium">Grant Summary</label>
        <textarea
          className="w-full p-3 border rounded-md h-32"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Describe the grant or leave blank if using AI..."
        />
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={useAI}
          onChange={() => setUseAI(!useAI)}
        />
        <span>Use AI to generate summary, requirements, and scoring criteria</span>
      </label>

      <button
        onClick={createGrant}
        disabled={creating || !title}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {creating ? "Creating..." : "Create Grant"}
      </button>
    </div>
  );
}

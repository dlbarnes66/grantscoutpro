"use client";

import { useEffect, useState } from "react";

export default function NarrativeEditorPage({ params }: any) {
  const { workspaceId, grantId, narrativeId } = params;

  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/grant/${grantId}/narrative/${narrativeId}`);
    const data = await res.json();
    setEntry(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [narrativeId]);

  async function save() {
    await fetch(`/api/grant/${grantId}/narrative/${narrativeId}`, {
      method: "PUT",
      body: JSON.stringify({ content: entry.content }),
    });
  }

  async function remove() {
    await fetch(`/api/grant/${grantId}/narrative/${narrativeId}`, {
      method: "DELETE",
    });

    window.location.href = `/dashboard/${params.workspaceId}/grant/${grantId}/narrative`;
  }

  if (loading) {
    return <div className="p-6 text-slate-300">Loading narrative…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-100">Edit Narrative</h1>

      <textarea
        className="w-full rounded border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 h-60"
        value={entry.content ?? ""}
        onChange={(e) => setEntry({ ...entry, content: e.target.value })}
      />

      <div className="flex gap-4">
        <button
          onClick={save}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>

        <button
          onClick={remove}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

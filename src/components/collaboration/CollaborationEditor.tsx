"use client";

import { useEffect, useState } from "react";

type Props = {
  workspaceId: string;
  userId: string;
};

export default function CollaborationEditor({ workspaceId, userId }: Props) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch(`/api/collab/edit?workspaceId=${workspaceId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setContent(data.content ?? "");
      } catch (e) {
        console.error("Load collaboration doc failed", e);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [workspaceId]);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/collab/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, userId, content })
      });
    } catch (e) {
      console.error("Save collaboration doc failed", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 flex flex-col gap-2 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">
          Shared collaboration document
        </h2>
        <button
          className="rounded-md bg-slate-700 px-3 py-1 text-xs text-slate-100 hover:bg-slate-600"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <textarea
        className="flex-1 w-full rounded-md border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100 resize-none"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Draft grant language, notes, and shared content here…"
      />
    </div>
  );
}

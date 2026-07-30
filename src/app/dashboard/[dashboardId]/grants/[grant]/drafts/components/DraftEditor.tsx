"use client";

import { useState, useEffect } from "react";

export function DraftEditor({ draft, grantId }: any) {
  const [title, setTitle] = useState(draft?.title || "");
  const [content, setContent] = useState(draft?.content || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(draft?.title || "");
    setContent(draft?.content || "");
  }, [draft?.id]);

  async function save() {
    setSaving(true);

    const endpoint = draft
      ? `/api/grant-drafts/${grantId}/update`
      : `/api/grant-drafts/${grantId}/save`;

    await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        id: draft?.id,
        title,
        content,
      }),
    });

    setSaving(false);
    alert("Draft saved!");
  }

  return (
    <div className="space-y-4">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Draft title"
        className="w-full border rounded px-3 py-2"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Draft content"
        className="w-full border rounded px-3 py-2 h-64"
      />

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {saving ? "Saving..." : "Save Draft"}
      </button>
    </div>
  );
}

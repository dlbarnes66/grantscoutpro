"use client";

import { useState, useEffect } from "react";

export function NarrativeEditor({ narrative, grantId }: any) {
  const [content, setContent] = useState(narrative?.content || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(narrative?.content || "");
  }, [narrative?.id]);

  async function save() {
    setSaving(true);

    const endpoint = narrative
      ? `/api/narrative/${grantId}/update`
      : `/api/narrative/${grantId}/save`;

    await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        id: narrative?.id,
        content,
      }),
    });

    setSaving(false);
    alert("Narrative saved!");
  }

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your narrative here..."
        className="w-full border rounded px-3 py-2 h-96"
      />

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {saving ? "Saving..." : "Save Narrative"}
      </button>
    </div>
  );
}

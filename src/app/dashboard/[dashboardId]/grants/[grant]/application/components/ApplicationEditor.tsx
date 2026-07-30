"use client";

import { useState, useEffect } from "react";

export function ApplicationEditor({ application, grantId }: any) {
  const [content, setContent] = useState(application?.content || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setContent(application?.content || "");
  }, [application?.id]);

  async function save() {
    setSaving(true);

    const endpoint = application
      ? `/api/application/${grantId}/update`
      : `/api/application/${grantId}/save`;

    await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({
        id: application?.id,
        content,
      }),
    });

    setSaving(false);
    alert("Application saved!");
    location.reload();
  }

  return (
    <div className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your application here..."
        className="w-full border rounded px-3 py-2 h-96"
      />

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {saving ? "Saving..." : "Save Application"}
      </button>
    </div>
  );
}

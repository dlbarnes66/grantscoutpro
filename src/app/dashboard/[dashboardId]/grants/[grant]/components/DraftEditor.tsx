"use client";

import { useState, useEffect } from "react";

export function DraftEditor({
  workspaceId,
  grantId,
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Load existing draft
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch(
          `/api/draft?workspaceId=${workspaceId}&grantId=${grantId}`
        );
        const data = await res.json();

        if (res.ok && data?.draft?.content) {
          setContent(data.draft.content);
        }
      } catch (err) {
        console.error("Failed to load draft", err);
      }
    }

    loadDraft();
  }, [workspaceId, grantId]);

  async function saveDraft() {
    try {
      setLoading(true);
      setMessage(null);

      const res = await fetch(`/api/draft`, {
        method: "POST",
        body: JSON.stringify({
          workspaceId,
          grantId,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to save draft");

      setMessage("Draft saved.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
      <h2 className="text-lg font-semibold">Draft Editor</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 p-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Write your grant draft here..."
      />

      <button
        onClick={saveDraft}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Draft"}
      </button>

      {message && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
          {message}
        </p>
      )}
    </div>
  );
}

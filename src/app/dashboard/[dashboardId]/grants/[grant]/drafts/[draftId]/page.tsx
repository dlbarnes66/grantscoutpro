"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DraftDetailPage({
  params,
}: {
  params: { workspaceId: string; grantId: string; draftId: string };
}) {
  const { workspaceId, grantId, draftId } = params;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/grant/${grantId}/drafts/${draftId}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load draft");
        }

        setTitle(data.title || "");
        setContent(data.content || "");
      } catch (err: any) {
        setError(err.message || "Error loading draft");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [grantId, draftId]);

  async function saveDraft() {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/grant/${grantId}/drafts/${draftId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save draft");
      }

      router.push(`/dashboard/${params.workspaceId}/grant/${grantId}/drafts`);
    } catch (err: any) {
      setError(err.message || "Error saving draft");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading draft…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Edit Draft</h1>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-gray-700 text-sm">Title</label>
          <input
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Draft title"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-gray-700 text-sm">Content</label>
          <textarea
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 h-64"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write draft content here…"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {/* Save */}
        <button
          onClick={saveDraft}
          disabled={saving}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Draft"}
        </button>

        {/* Cancel */}
        <button
          onClick={() =>
            router.push(`/dashboard/${params.workspaceId}/grant/${grantId}/drafts`)
          }
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

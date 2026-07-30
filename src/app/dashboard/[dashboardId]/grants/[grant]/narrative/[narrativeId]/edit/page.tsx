"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function EditNarrativeEntryPage({
  params,
}: {
  params: { workspaceId: string; grantId: string; entryId: string };
}) {
  const { workspaceId, grantId, entryId } = params;
  const router = useRouter();

  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing entry
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/grant/${grantId}/narrative/${entryId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load narrative entry");
        }

        setContent(data.content || "");
      } catch (err: any) {
        setError(err.message || "Error loading narrative entry");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [grantId, entryId]);

  async function saveEntry() {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(
        `/api/grant/${grantId}/narrative/${entryId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save narrative entry");
      }

      router.push(
        `/dashboard/${workspaceId}/grant/${grantId}/narrative/${entryId}`
      );
    } catch (err: any) {
      setError(err.message || "Error saving narrative entry");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-gray-400">Loading entry…</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Edit Narrative Entry</h1>

      {/* Textarea */}
      <textarea
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 h-60"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Update your narrative entry…"
      />

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {/* Save */}
      <button
        onClick={saveEntry}
        disabled={saving}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save Entry"}
      </button>

      {/* Cancel */}
      <button
        onClick={() =>
          router.push(
            `/dashboard/${workspaceId}/grant/${grantId}/narrative/${entryId}`
          )
        }
        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  );
}

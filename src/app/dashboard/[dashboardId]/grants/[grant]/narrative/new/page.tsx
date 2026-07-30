"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNarrativePage({
  params,
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;
  const router = useRouter();

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createNarrative() {
    try {
      setSaving(true);
      setError(null);

      const res = await fetch(`/api/grant/${grantId}/narrative`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create narrative entry");
      }

      router.push(
        `/dashboard/${workspaceId}/grant/${grantId}/narrative/${data.id}`
      );
    } catch (err: any) {
      setError(err.message || "Error creating narrative entry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">New Narrative Entry</h1>

      {/* Textarea */}
      <textarea
        className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 h-60"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your narrative here…"
      />

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {/* Create */}
      <button
        onClick={createNarrative}
        disabled={saving}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Creating…" : "Create Entry"}
      </button>

      {/* Cancel */}
      <button
        onClick={() =>
          router.push(`/dashboard/${workspaceId}/grant/${grantId}/narrative`)
        }
        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
      >
        Cancel
      </button>
    </div>
  );
}

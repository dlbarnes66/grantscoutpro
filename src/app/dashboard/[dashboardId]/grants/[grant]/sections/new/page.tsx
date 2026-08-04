
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewSectionPage({
  params,
}: {
  params: { workspaceId: string; grantId: string };
}) {
  const { workspaceId, grantId } = params;
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function createSection() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/grant/${grantId}/sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create section");
      }

      router.push(
        `/dashboard/${params.workspaceId}/grant/${grantId}/sections/${data.id}`
      );
    } catch (err: any) {
      setError(err.message || "Error creating section");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">New Section</h1>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-gray-700 text-sm">Title</label>
          <input
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Section title"
          />
        </div>

        {/* Content */}
        <div>
          <label className="text-gray-700 text-sm">Content</label>
          <textarea
            className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 h-40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write section content here…"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        {/* Submit */}
        <button
          onClick={createSection}
          disabled={loading}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create Section"}
        </button>
      </div>
    </div>
  );
}

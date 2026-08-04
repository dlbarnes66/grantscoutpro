"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GrantSectionDetailPage({
  params,
}: {
  params: { workspaceId: string; grantId: string; sectionId: string };
}) {
  const { workspaceId, grantId, sectionId } = params;

  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(
          `/api/grant/${grantId}/sections/${sectionId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to load section");
        }

        setSection(data);
      } catch (err: any) {
        setError(err.message || "Error loading section");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [grantId, sectionId]);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading section…</div>;
  }

  if (error || !section) {
    return (
      <div className="p-6 text-red-500">
        {error ?? "Section not found."}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{section.title}</h1>

        <Link
          href={`/dashboard/${params.workspaceId}/grant/${grantId}/sections/${sectionId}/edit`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Edit Section
        </Link>
      </div>

      {/* Content */}
      <div className="rounded border border-gray-200 bg-white p-4">
        {section.content ? (
          <p className="text-gray-700 whitespace-pre-wrap">
            {section.content}
          </p>
        ) : (
          <p className="text-gray-500">No content yet.</p>
        )}
      </div>

      {/* Back Link */}
      <Link
        href={`/dashboard/${params.workspaceId}/grant/${grantId}/sections`}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Back to Sections
      </Link>
    </div>
  );
}

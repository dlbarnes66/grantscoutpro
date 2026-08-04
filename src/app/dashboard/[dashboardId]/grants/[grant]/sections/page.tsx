"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GrantSectionsPage({ params }: any) {
  const { workspaceId, grantId } = params;

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grant/${grantId}/sections`);
      const data = await res.json();
      setSections(data);
      setLoading(false);
    }
    load();
  }, [grantId]);

  if (loading) {
    return <div className="p-6 text-slate-300">Loading sections…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Grant Sections</h1>

        <Link
          href={`/dashboard/${params.workspaceId}/grant/${grantId}/sections/new`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Section
        </Link>
      </div>

      {sections.length === 0 ? (
        <p className="text-slate-400">No sections yet.</p>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <Link
              key={section.id}
              href={`/dashboard/${params.workspaceId}/grant/${grantId}/sections/${section.id}`}
              className="block rounded border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800 transition"
            >
              <div className="text-slate-100 font-semibold">{section.title}</div>
              <div className="text-slate-400 text-sm">
                {section.content?.slice(0, 120) ?? "No content yet…"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

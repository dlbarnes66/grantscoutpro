"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function ApplicationPage({ params }: any) {
  const { workspaceId, grantId } = params;

  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grant/${grantId}/application`);
      const data = await res.json();
      setApps(data);
      setLoading(false);
    }
    load();
  }, [grantId]);

  if (loading) {
    return <div className="p-6 text-slate-300">Loading applications…</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Applications</h1>

        <Link
          href={`/dashboard/${params.workspaceId}/grant/${grantId}/application/new`}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Application
        </Link>
      </div>

      {apps.length === 0 ? (
        <p className="text-slate-400">No applications yet.</p>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Link
              key={app.id}
              href={`/dashboard/${params.workspaceId}/grant/${grantId}/application/${app.id}`}
              className="block rounded border border-slate-800 bg-slate-900/60 p-4 hover:bg-slate-800 transition"
            >
              <div className="text-slate-100 font-semibold">
                Application created {new Date(app.createdAt).toLocaleDateString()}
              </div>
              <div className="text-slate-400 text-sm">
                {app.content?.slice(0, 120) ?? "No content yet…"}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

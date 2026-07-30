"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";

export default function ApplicationsPage() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/applications/list", {
        method: "POST",
        body: JSON.stringify({ workspaceId: null }),
      });

      const data = await res.json();
      setApps(data.applications || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading applications…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Applications</h1>

      <div className="space-y-4">
        {apps.map((app) => (
          <a
            key={app.id}
            href={`/applications/${app.id}`}
            className="block border rounded p-4 hover:bg-gray-50"
          >
            <h2 className="font-semibold">{app.grantTitle}</h2>
            <p className="text-sm text-gray-600">
              Status: {app.status} • Updated:{" "}
              {new Date(app.updatedAt).toLocaleDateString()}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

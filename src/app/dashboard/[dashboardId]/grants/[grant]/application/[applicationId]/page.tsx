"use client";

import { useEffect, useState } from "react";

export default function ApplicationEditorPage({ params }: any) {
  const { workspaceId, grantId, applicationId } = params;

  const [app, setApp] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/grant/${grantId}/application/${applicationId}`);
    const data = await res.json();
    setApp(data);

    const vRes = await fetch(`/api/grant/${grantId}/application/${applicationId}/versions`);
    const vData = await vRes.json();
    setVersions(vData);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [applicationId]);

  async function save() {
    await fetch(`/api/grant/${grantId}/application/${applicationId}`, {
      method: "PUT",
      body: JSON.stringify({ content: app.content }),
    });
    load();
  }

  async function remove() {
    await fetch(`/api/grant/${grantId}/application/${applicationId}`, {
      method: "DELETE",
    });

    window.location.href = `/dashboard/${params.workspaceId}/grant/${grantId}/application`;
  }

  if (loading) {
    return <div className="p-6 text-slate-300">Loading application…</div>;
  }

  return (
    <div className="p-6 space-y-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-100">Edit Application</h1>

      <textarea
        className="w-full rounded border border-slate-800 bg-slate-900/60 px-3 py-2 text-slate-100 h-80"
        value={app.content ?? ""}
        onChange={(e) => setApp({ ...app, content: e.target.value })}
      />

      <div className="flex gap-4">
        <button
          onClick={save}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>

        <button
          onClick={remove}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      {/* Versions */}
      <section className="rounded border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Versions</h2>

        {versions.length === 0 ? (
          <p className="text-slate-400">No versions yet.</p>
        ) : (
          <ul className="space-y-2 text-slate-300 text-sm">
            {versions.map((v) => (
              <li key={v.id}>
                Version from {new Date(v.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

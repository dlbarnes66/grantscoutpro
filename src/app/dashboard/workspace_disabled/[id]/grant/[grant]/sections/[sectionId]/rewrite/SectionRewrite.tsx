"use client";

import { useState, useEffect } from "react";

export default function SectionRewrite({
  workspaceId,
  grantId,
  sectionId
}: {
  workspaceId: string;
  grantId: string;
  sectionId: string;
}) {
  const [section, setSection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [rewriting, setRewriting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grants/${grantId}/sections/${sectionId}`);
      const json = await res.json();
      setSection(json.section);
      setLoading(false);
    }
    load();
  }, [grantId, sectionId]);

  async function runRewrite() {
    setRewriting(true);

    const res = await fetch("/api/grants/rewrite", {
      method: "POST",
      body: JSON.stringify({ sectionId }),
    });

    const data = await res.json();
    setResult(data);
    setRewriting(false);
  }

  async function saveRewrite() {
    if (!result) return;

    setSaving(true);

    await fetch(`/api/grants/${grantId}/sections/${sectionId}/update`, {
      method: "POST",
      body: JSON.stringify({
        content: result.rewritten
      }),
    });

    setSaving(false);
  }

  if (loading) {
    return <p>Loading section...</p>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold">{section.title}</h2>

      <p className="text-gray-700 whitespace-pre-wrap">{section.content}</p>

      <button
        onClick={runRewrite}
        disabled={rewriting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {rewriting ? "Rewriting..." : "Run AI Rewrite"}
      </button>

      {result && (
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-xl font-semibold">Rewritten Version</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {result.rewritten}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Rewrite Notes</h3>
            <ul className="list-disc ml-6">
              {result.notes.map((n: string, i: number) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={saveRewrite}
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded-md"
          >
            {saving ? "Saving..." : "Replace Section with Rewrite"}
          </button>
        </div>
      )}
    </div>
  );
}

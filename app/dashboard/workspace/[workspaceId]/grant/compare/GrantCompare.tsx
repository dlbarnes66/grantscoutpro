"use client";

import { useEffect, useState } from "react";

export default function GrantCompare({
  workspaceId
}: {
  workspaceId: string;
}) {
  const [grants, setGrants] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/workspace/${workspaceId}/grants`);
      const json = await res.json();
      setGrants(json.grants || []);
      setLoading(false);
    }
    load();
  }, [workspaceId]);

  function toggleGrant(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : [...prev, id]
    );
  }

  async function generate() {
    if (selected.length < 2) return;

    setGenerating(true);

    const res = await fetch("/api/grants/compare", {
      method: "POST",
      body: JSON.stringify({ grantIds: selected }),
    });

    const json = await res.json();
    setReport(json);
    setGenerating(false);
  }

  if (loading) {
    return <p>Loading grants...</p>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Select Grants to Compare</h2>

      <div className="space-y-3">
        {grants.map((g) => (
          <label key={g.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selected.includes(g.id)}
              onChange={() => toggleGrant(g.id)}
            />
            <span>{g.title}</span>
          </label>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={generating || selected.length < 2}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {generating ? "Comparing..." : "Generate Comparison Report"}
      </button>

      {report && (
        <div className="space-y-6 mt-6">
          <div>
            <h3 className="text-xl font-semibold">Comparison Summary</h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {report.summary}
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Fit Scores</h3>
            <ul className="list-disc ml-6">
              {report.fitScores.map((fs: any, i: number) => {
                const grant = grants.find((g) => g.id === fs.grantId);
                return (
                  <li key={i}>
                    {grant?.title}: {fs.score}/100
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">Strengths</h3>
            {selected.map((id) => {
              const grant = grants.find((g) => g.id === id);
              return (
                <div key={id} className="mt-3">
                  <h4 className="font-semibold">{grant?.title}</h4>
                  <ul className="list-disc ml-6">
                    {report.strengths[id].map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-xl font-semibold">Weaknesses</h3>
            {selected.map((id) => {
              const grant = grants.find((g) => g.id === id);
              return (
                <div key={id} className="mt-3">
                  <h4 className="font-semibold">{grant?.title}</h4>
                  <ul className="list-disc ml-6">
                    {report.weaknesses[id].map((w: string, i: number) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="text-xl font-semibold">Recommendations</h3>
            {selected.map((id) => {
              const grant = grants.find((g) => g.id === id);
              return (
                <div key={id} className="mt-3">
                  <h4 className="font-semibold">{grant?.title}</h4>
                  <ul className="list-disc ml-6">
                    {report.recommendations[id].map((r: string, i: number) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

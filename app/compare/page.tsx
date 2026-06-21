"use client";

import { useEffect, useState } from "react";

export default function ComparePage() {
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState([]);
  const [comparison, setComparison] = useState(null);

  async function fetchSaved() {
    const res = await fetch("/api/saved-grants", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setSaved(data.saved || []);
    }
  }

  async function createComparison() {
    const res = await fetch("/api/grant-comparisons", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grantIds: selected }),
    });

    if (res.ok) {
      const data = await res.json();
      loadComparison(data.comparison.id);
    }
  }

  async function loadComparison(id) {
    const res = await fetch(`/api/grant-comparisons/${id}`, {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setComparison(data.grants);
    }
  }

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Compare Grants</h1>

        {/* Saved Grants List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {saved.map((grant) => (
            <label
              key={grant.id}
              className="p-4 border rounded-lg bg-white shadow-sm flex gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selected.includes(grant.id)}
                onChange={() => {
                  if (selected.includes(grant.id)) {
                    setSelected(selected.filter((x) => x !== grant.id));
                  } else {
                    setSelected([...selected, grant.id]);
                  }
                }}
              />

              <div>
                <h3 className="text-lg font-semibold">{grant.title}</h3>
                {grant.agency && (
                  <p className="text-gray-600">{grant.agency}</p>
                )}
              </div>
            </label>
          ))}
        </div>

        <button
          onClick={createComparison}
          disabled={selected.length < 2}
          className={`px-6 py-3 rounded-lg text-white font-semibold ${
            selected.length < 2
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          Compare Selected
        </button>

        {/* Comparison Table */}
        {comparison && (
          <div className="mt-12 overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">Field</th>
                  {comparison.map((g) => (
                    <th key={g.id} className="p-3 border">
                      {g.title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  "agency",
                  "amount",
                  "deadline",
                  "category",
                  "summary",
                  "url",
                ].map((field) => (
                  <tr key={field}>
                    <td className="p-3 border font-semibold capitalize">
                      {field}
                    </td>
                    {comparison.map((g) => (
                      <td key={g.id} className="p-3 border">
                        {g[field] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

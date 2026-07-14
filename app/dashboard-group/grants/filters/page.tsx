"use client";

import { useEffect, useState } from "react";

export default function GrantFiltersPage() {
  const [facets, setFacets] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFacets() {
      const res = await fetch("/api/grants/facets", {
        method: "POST",
        body: JSON.stringify({
          tier: "ENTERPRISE",
          workspaceId: null,
        }),
      });

      const data = await res.json();
      setFacets(data);
      setLoading(false);
    }

    loadFacets();
  }, []);

  if (loading) return <div className="p-6">Loading filters…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Grant Filters</h1>

      <div className="grid grid-cols-3 gap-6">
        <FilterSection title="Categories" items={facets.categories} />
        <FilterSection title="Agencies" items={facets.agencies} />
        <FilterSection title="States" items={facets.states} />
        <FilterSection title="Foundations" items={facets.foundations} />
        <FilterSection title="Philanthropic" items={facets.philanthropic} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Funding Range</h2>
        <p>
          Min: {facets.amountRange.min ?? "N/A"} • Max:{" "}
          {facets.amountRange.max ?? "N/A"}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Deadlines</h2>
        <p>
          Earliest:{" "}
          {facets.deadlines.earliest
            ? new Date(facets.deadlines.earliest).toLocaleDateString()
            : "N/A"}
        </p>
        <p>
          Latest:{" "}
          {facets.deadlines.latest
            ? new Date(facets.deadlines.latest).toLocaleDateString()
            : "N/A"}
        </p>
      </div>
    </div>
  );
}

function FilterSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div className="space-y-1">
        {items.length === 0 && (
          <p className="text-gray-500 text-sm">None available</p>
        )}
        {items.map((item) => (
          <p key={item} className="text-sm text-gray-700">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

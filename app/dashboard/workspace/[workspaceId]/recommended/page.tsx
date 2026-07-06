"use client";

import { useState } from "react";
import RecommendedGrantCard from "./RecommendedGrantCard";

export default function RecommendedGrantsPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  async function loadMatches() {
    setLoading(true);

    const res = await fetch("/api/grants/match", {
      method: "POST",
      body: JSON.stringify({ workspaceId }),
    });

    const data = await res.json();
    setMatches(data.matches || []);
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Recommended Grants</h1>

      <button
        onClick={loadMatches}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Loading..." : "Load Recommended Grants"}
      </button>

      <div className="space-y-4">
        {matches.map((grant, i) => (
          <RecommendedGrantCard key={i} grant={grant} />
        ))}
      </div>
    </div>
  );
}

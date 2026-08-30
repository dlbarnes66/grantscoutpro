"use client";

import { useState } from "react";
import MatchResults from "@/components/matching/MatchResults";

export default function MatchingPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  async function runMatch() {
    setLoading(true);

    const project = {
      title: "Community Youth STEM Program",
      focus: "STEM education",
      population: "underserved youth",
      location: "Alabama",
    };

    const grants = [
      {
        id: "g1",
        title: "STEM Education Expansion Grant",
        focus: "STEM education",
        location: "USA",
      },
      {
        id: "g2",
        title: "Youth Development Fund",
        focus: "youth programs",
        location: "Southern states",
      },
    ];

    const res = await fetch("/api/ai/match", {
      method: "POST",
      body: JSON.stringify({ project, grants }),
    });

    const data = await res.json();

    setResults(data.results ?? []);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        AI Grant Matching
      </h1>

      <button
        onClick={runMatch}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
      >
        Run Matching
      </button>

      {loading && (
        <div className="text-slate-400">
          Matching grants...
        </div>
      )}

      <MatchResults results={results} />
    </div>
  );
}
"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useState } from "react";

export default function GrantMatchingPage() {
  const [profile, setProfile] = useState({
    mission: "",
    state: "",
    orgType: "",
    budget: "",
    category: "",
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function runMatching() {
    setLoading(true);

    const res = await fetch("/api/grants/match", {
      method: "POST",
      body: JSON.stringify({
        workspaceId: null,
        tier: "ENTERPRISE",
        profile,
      }),
    });

    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Grant Matching AI</h1>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Mission" value={profile.mission} onChange={(v) => setProfile({ ...profile, mission: v })} />
        <Input label="State" value={profile.state} onChange={(v) => setProfile({ ...profile, state: v })} />
        <Input label="Organization Type" value={profile.orgType} onChange={(v) => setProfile({ ...profile, orgType: v })} />
        <Input label="Budget" value={profile.budget} onChange={(v) => setProfile({ ...profile, budget: v })} />
        <Input label="Category" value={profile.category} onChange={(v) => setProfile({ ...profile, category: v })} />
      </div>

      <button
        onClick={runMatching}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Matching…" : "Run Matching"}
      </button>

      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.grant.id} className="border rounded p-4">
            <h2 className="font-semibold">{r.grant.title}</h2>
            <p className="text-sm text-gray-600">Score: {r.score}</p>
            <p className="text-sm text-gray-600">Source: {r.grant.source}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        className="border rounded px-3 py-2 w-full"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

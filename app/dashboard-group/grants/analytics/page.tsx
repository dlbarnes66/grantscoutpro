"use client";

import { useEffect, useState } from "react";

export default function GrantAnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      const res = await fetch("/api/grants/analytics", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: null,
          tier: "ENTERPRISE",
        }),
      });

      const data = await res.json();
      setAnalytics(data);
      setLoading(false);
    }

    loadAnalytics();
  }, []);

  if (loading) return <div className="p-6">Loading analytics…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Grant Analytics Dashboard</h1>

      <div className="grid grid-cols-3 gap-6">
        <Stat title="Total Grants" value={analytics.totals.grants} />
        <Stat title="Total Funding" value={analytics.totals.totalFunding} />
        <Stat title="Avg Funding" value={analytics.totals.avgFunding} />
      </div>

      <Section title="Categories" items={analytics.categories} />
      <Section title="Agencies" items={analytics.agencies} />
      <Section title="States" items={analytics.states} />
      <Section title="Foundations" items={analytics.foundations} />

      <div>
        <h2 className="text-xl font-semibold mb-2">AI Score Averages</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm">
          {JSON.stringify(analytics.aiScores, null, 2)}
        </pre>
      </div>
    </div>
  );
}

function Stat({ title, value }: any) {
  return (
    <div className="border rounded p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-xl">{value}</p>
    </div>
  );
}

function Section({ title, items }: any) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <pre className="bg-gray-100 p-3 rounded text-sm">
        {JSON.stringify(items, null, 2)}
      </pre>
    </div>
  );
}

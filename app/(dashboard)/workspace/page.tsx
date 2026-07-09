"use client";

import { useEffect, useState } from "react";

export default function WorkspaceDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/workspace/dashboard", {
        method: "POST",
        body: JSON.stringify({ workspaceId: null }),
      });

      const json = await res.json();
      setData(json);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading workspace…</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Workspace Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <Stat title="Grants" value={data.stats.grants} />
        <Stat title="Applications" value={data.stats.applications} />
        <Stat title="Alerts" value={data.stats.alerts} />
        <Stat title="AI Matches" value={data.stats.matches} />
      </div>

      {/* Recent Grants */}
      <Section title="Recent Grants">
        {data.recentGrants.map((g: any) => (
          <a
            key={g.id}
            href={`/grants/${g.id}`}
            className="block border rounded p-3 hover:bg-gray-50"
          >
            <h3 className="font-semibold">{g.title}</h3>
            <p className="text-sm text-gray-600">{g.source}</p>
          </a>
        ))}
      </Section>

      {/* Alerts */}
      <Section title="Alerts">
        {data.alerts.map((a: any) => (
          <div key={a.grantId} className="border rounded p-3">
            <h3 className="font-semibold">Grant ID: {a.grantId}</h3>
            <ul className="list-disc ml-6 text-sm text-gray-700">
              {a.alerts.map((alert: any, idx: number) => (
                <li key={idx}>
                  <strong>{alert.type}:</strong> {alert.message}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Section>

      {/* Team */}
      <Section title="Team Members">
        {data.team.map((t: any) => (
          <div key={t.id} className="border rounded p-3">
            <p className="font-semibold">{t.name}</p>
            <p className="text-sm text-gray-600">{t.role}</p>
          </div>
        ))}
      </Section>
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

function Section({ title, children }: any) {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

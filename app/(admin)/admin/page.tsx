"use client";

import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/dashboard", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const json = await res.json();
      setData(json);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading admin dashboard…</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-semibold">Admin Console</h1>

      <div className="grid grid-cols-4 gap-6">
        <Stat title="Total Users" value={data.stats.users} />
        <Stat title="Total Workspaces" value={data.stats.workspaces} />
        <Stat title="Total Grants" value={data.stats.grants} />
        <Stat title="Active Subscriptions" value={data.stats.subscriptions} />
      </div>

      <Section title="System Metrics">
        <pre className="bg-gray-100 p-3 rounded text-sm">
          {JSON.stringify(data.metrics, null, 2)}
        </pre>
      </Section>

      <Section title="Admin Tools">
        <div className="space-y-3">
          <a href="/admin/users" className="block border rounded p-3 hover:bg-gray-50">
            Manage Users
          </a>
          <a href="/admin/workspaces" className="block border rounded p-3 hover:bg-gray-50">
            Manage Workspaces
          </a>
          <a href="/admin/ingestion" className="block border rounded p-3 hover:bg-gray-50">
            Run Grant Ingestion
          </a>
        </div>
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

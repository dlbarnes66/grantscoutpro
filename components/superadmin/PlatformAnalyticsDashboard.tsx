"use client";

import { useEffect, useState } from "react";

export default function PlatformAnalyticsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/superadmin/platform-analytics");
      const json = await res.json();
      setData(json);
    }
    load();
  }, []);

  if (!data) return <div>Loading platform analytics…</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Platform Analytics</h1>

      {/* Totals */}
      <section className="p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">Totals</h2>
        <div className="grid grid-cols-2 gap-4">
          <Metric label="Users" value={data.totals.users} />
          <Metric label="Workspaces" value={data.totals.workspaces} />
          <Metric label="Grants" value={data.totals.grants} />
          <Metric label="Documents" value={data.totals.documents} />
        </div>
      </section>

      {/* AI Usage */}
      <section className="p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">AI Usage</h2>
        <div className="grid grid-cols-2 gap-4">
          <Metric label="Tokens Used" value={data.ai.tokens} />
          <Metric label="AI Cost ($)" value={data.ai.cost.toFixed(4)} />
        </div>
      </section>

      {/* Billing */}
      <section className="p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">Billing</h2>
        <Metric label="Total Revenue ($)" value={data.billing.revenue.toFixed(2)} />
      </section>

      {/* Growth */}
      <section className="p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">Growth (Last 30 Days)</h2>
        <div className="grid grid-cols-2 gap-4">
          <Metric label="New Users" value={data.growth.newUsers30d} />
          <Metric label="New Workspaces" value={data.growth.newWorkspaces30d} />
        </div>
      </section>

      {/* Churn */}
      <section className="p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">Churn</h2>
        <Metric label="Churned Workspaces" value={data.churn.churnedWorkspaces} />
      </section>

      {/* Enterprise */}
      <section className="p-4 border rounded bg-white shadow">
        <h2 className="text-xl font-semibold mb-3">Enterprise Adoption</h2>
        <Metric label="Enterprise Workspaces" value={data.enterprise.enterpriseWorkspaces} />
      </section>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="p-3 border rounded bg-gray-50">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

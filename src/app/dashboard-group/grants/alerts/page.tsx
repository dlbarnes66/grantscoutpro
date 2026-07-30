"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";

export default function GrantAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      const res = await fetch("/api/grants/alerts", {
        method: "POST",
        body: JSON.stringify({
          workspaceId: null,
          tier: "ENTERPRISE",
        }),
      });

      const data = await res.json();
      setAlerts(data.alerts || []);
      setLoading(false);
    }

    loadAlerts();
  }, []);

  if (loading) return <div className="p-6">Loading alerts…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Grant Alerts</h1>

      {alerts.length === 0 && (
        <p className="text-gray-500">No alerts available.</p>
      )}

      <div className="space-y-4">
        {alerts.map((a) => (
          <div key={a.grantId} className="border rounded p-4">
            <h2 className="font-semibold">Grant ID: {a.grantId}</h2>
            <ul className="list-disc ml-6 text-sm text-gray-700">
              {a.alerts.map((alert: any, idx: number) => (
                <li key={idx}>
                  <strong>{alert.type}:</strong> {alert.message}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

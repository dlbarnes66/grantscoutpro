"use client"

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function BillingLogsPage() {
  const searchParams = useSearchParams();
  const workspaceId = searchParams.get("workspaceId");

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const url = workspaceId
          ? `/api/admin/billing/logs?workspaceId=${workspaceId}`
          : `/api/admin/billing/logs`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error("Failed to load billing logs:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [workspaceId]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Billing Logs</h1>

      {workspaceId && (
        <p className="text-gray-600">
          Showing logs for workspace: <strong>{workspaceId}</strong>
        </p>
      )}

      <a
        href="/admin/billing"
        className="text-blue-600 underline inline-block"
      >
        ← Back to Billing Dashboard
      </a>

      {loading ? (
        <p>Loading logs…</p>
      ) : logs.length === 0 ? (
        <p>No billing logs found.</p>
      ) : (
        <table className="min-w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">Timestamp</th>
              <th className="border p-2">Workspace</th>
              <th className="border p-2">Event</th>
              <th className="border p-2">Message</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2">
                  {new Date(log.createdAt).toLocaleString()}
                </td>

                <td className="border p-2">{log.workspaceId}</td>

                <td className="border p-2">{log.event}</td>

                <td className="border p-2">{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

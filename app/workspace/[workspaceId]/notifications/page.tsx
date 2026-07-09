"use client";

import { useEffect, useState } from "react";

export default function NotificationsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/notifications`);
      const json = await res.json();
      setNotifications(json.notifications || []);
      setLoading(false);
    };

    load();
  }, [workspaceId]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {loading && <p className="text-gray-600">Loading...</p>}

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="border rounded-lg p-4 bg-white shadow-sm"
          >
            <p className="font-semibold">{n.message}</p>

            <p className="text-sm text-gray-600 mt-1">
              {new Date(n.createdAt).toLocaleString()}
            </p>

            {n.metadata && (
              <pre className="text-xs text-gray-700 mt-3 bg-gray-100 p-2 rounded">
                {JSON.stringify(n.metadata, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

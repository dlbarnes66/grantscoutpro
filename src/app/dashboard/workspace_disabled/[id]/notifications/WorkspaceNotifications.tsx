"use client";

import { useEffect, useState } from "react";

export default function WorkspaceNotifications({
  workspaceId
}: {
  workspaceId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const response = await fetch(
        "/api/workspace/" + workspaceId + "/notifications"
      );
      const json = await response.json();
      setNotifications(json.notifications || []);
      setLoading(false);
    }
    load();
  }, [workspaceId]);

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      {notifications.length === 0 && (
        <p className="text-gray-600">No notifications at this time.</p>
      )}

      {notifications.map((n, i) => (
        <div
          key={i}
          className="p-4 border rounded-md bg-gray-50 space-y-2"
        >
          <h3 className="font-semibold">{n.title}</h3>
          <p className="text-gray-700 whitespace-pre-wrap">
            {n.message}
          </p>

          <span
            className={
              "inline-block px-3 py-1 text-sm rounded-md " +
              (n.type === "deadline"
                ? "bg-red-200 text-red-800"
                : n.type === "risk"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-blue-200 text-blue-800")
            }
          >
            {n.type}
          </span>
        </div>
      ))}
    </div>
  );
}

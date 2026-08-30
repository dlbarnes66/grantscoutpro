"use client";

import { useEffect, useState } from "react";

type Props = {
  workspaceId: string;
  userId: string;
};

type PresenceUser = {
  userId: string;
  name: string;
  status: "online" | "away" | "offline";
};

export default function CollaborationPresence({ workspaceId, userId }: Props) {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    let active = true;

    async function updatePresence() {
      try {
        await fetch(`/api/workspace/${workspaceId}/presence`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, status: "online" })
        });
      } catch (e) {
        console.error("Presence update failed", e);
      }
    }

    async function loadPresence() {
      try {
        const res = await fetch(`/api/workspace/${workspaceId}/presence`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setUsers(data.users ?? []);
      } catch (e) {
        console.error("Presence load failed", e);
      }
    }

    updatePresence();
    loadPresence();

    const interval = setInterval(loadPresence, 10_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [workspaceId, userId]);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      <h2 className="text-sm font-semibold text-slate-200 mb-2">
        Live collaborators
      </h2>
      {users.length === 0 ? (
        <p className="text-xs text-slate-500">You’re the only one here right now.</p>
      ) : (
        <ul className="space-y-1">
          {users.map((u) => (
            <li key={u.userId} className="flex items-center gap-2 text-xs text-slate-200">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  u.status === "online"
                    ? "bg-emerald-400"
                    : u.status === "away"
                    ? "bg-amber-400"
                    : "bg-slate-500"
                }`}
              />
              <span>{u.name || u.userId}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import NotificationItem from "./NotificationItem";
import { Notification } from "./types";

export default function NotificationList({
  notifications,
  onUpdate
}: {
  notifications: Notification[];
  onUpdate: (n: Notification[]) => void;
}) {
  function markAllRead() {
    onUpdate(notifications.map((n) => ({ ...n, read: true })));
  }

  function clearAll() {
    onUpdate([]);
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">Notifications</h2>

        <div className="flex gap-3">
          <button
            onClick={markAllRead}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Mark All Read
          </button>

          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-300"
          >
            Clear All
          </button>
        </div>
      </div>

      <ul className="space-y-4">
        {notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            notifications={notifications}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </div>
  );
}

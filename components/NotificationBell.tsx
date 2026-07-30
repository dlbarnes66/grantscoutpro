"use client";

import { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";

interface NotificationItem {
  id: number;
  text: string;
}

export default function NotificationBell() {
  const [open, setOpen] = useState<boolean>(false);

  // Placeholder notifications
  const notifications: NotificationItem[] = [
    { id: 1, text: "Your grant search job has completed." },
    { id: 2, text: "A new grant matches your saved search." },
    { id: 3, text: "Your account was accessed from a new device." },
  ];

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="relative text-gray-600 hover:text-brandBlue transition"
      >
        <BellIcon className="w-7 h-7" />

        {/* Badge */}
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-brandBlue text-white text-xs px-1.5 py-0.5 rounded-full shadow">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 mt-3 w-72 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b font-semibold text-brandBlue">
            Notifications
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="px-4 py-3 text-sm text-gray-700 border-b hover:bg-gray-50 transition"
              >
                {n.text}
              </div>
            ))}
          </div>

          <button
            onClick={() => setOpen(false)}
            className="w-full text-center py-2 text-sm text-brandBlue hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import NotificationFilters from "@/components/notifications/NotificationFilters";
import NotificationList from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [notifications, setNotifications] = useState<any[]>([]);

  function handleFilterChange(nextFilter: string) {
    setFilter(nextFilter);
  }

  function handleUpdate(nextNotifications: any[]) {
    setNotifications(nextNotifications);
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-slate-100">Notifications</h1>

      <NotificationFilters filter={filter} onChange={handleFilterChange} />

      <NotificationList
        notifications={notifications}
        onUpdate={handleUpdate}
      />
    </div>
  );
}

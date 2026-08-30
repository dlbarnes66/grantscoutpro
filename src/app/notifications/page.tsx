"use client";

import { useMemo, useState } from "react";

import NotificationFilters, {
  NotificationFilter,
} from "@/components/notifications/NotificationFilters";

import NotificationList from "@/components/notifications/NotificationList";

export default function NotificationsPage() {
  const [active, setActive] =
    useState<NotificationFilter>("all");

  const [notifications, setNotifications] =
    useState<any[]>([
      {
        id: "1",
        type: "deadline",
        title: "Grant deadline approaching",
        message:
          "STEM Education Expansion Grant closes in 3 days.",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "ai",
        title: "AI recommendation available",
        message:
          "A new funding opportunity has been matched.",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "3",
        type: "collaboration",
        title: "Document updated",
        message:
          "A collaborator modified a shared document.",
        read: true,
        createdAt: new Date().toISOString(),
      },
    ]);

  const filteredNotifications =
    useMemo(() => {
      if (active === "all") {
        return notifications;
      }

      return notifications.filter(
        (n) => n.type === active
      );
    }, [notifications, active]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Notifications
        </h1>

        <p className="text-slate-400 text-sm">
          Manage alerts, deadlines,
          collaboration updates and AI
          activity.
        </p>
      </div>

      <NotificationFilters
        active={active}
        onChangeAction={setActive}
      />

      <NotificationList
        notifications={filteredNotifications}
        onUpdateAction={setNotifications}
      />
    </div>
  );
}
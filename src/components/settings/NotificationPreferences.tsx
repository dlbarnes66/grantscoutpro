"use client"

import { useState } from "react";
import { NotificationPrefs } from "./types";

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email: true,
    push: true,
    aiAlerts: true,
  });

  function toggle<K extends keyof NotificationPrefs>(key: K) {
    setPrefs({ ...prefs, [key]: !prefs[key] });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Notification Preferences
      </h2>

      <div className="space-y-3 text-sm text-slate-300">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.email}
            onChange={() => toggle("email")}
          />
          Email Notifications
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.push}
            onChange={() => toggle("push")}
          />
          Push Notifications
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={prefs.aiAlerts}
            onChange={() => toggle("aiAlerts")}
          />
          AI Insights Alerts
        </label>
      </div>

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Save Preferences
      </button>
    </div>
  );
}

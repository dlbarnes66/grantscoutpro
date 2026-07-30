"use client";

import { useState } from "react";

export default function WorkspaceSettingsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const [name, setName] = useState("");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function saveSettings() {
    try {
      setLoading(true);
      setStatus(null);

      // Placeholder for future API integration
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStatus("Workspace settings saved.");
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-2">
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
        <p className="text-sm text-gray-600">
          Manage workspace preferences, features, and configuration.
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-6">
        <h2 className="text-lg font-semibold">General</h2>

        <div>
          <label className="text-sm text-gray-600">Workspace Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm"
            placeholder="Enter workspace name"
          />
        </div>

        <h2 className="text-lg font-semibold">Features</h2>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => setAiEnabled(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">Enable AI Tools</span>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-gray-700">Enable Notifications</span>
        </div>

        <button
          onClick={saveSettings}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>

        {status && (
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}

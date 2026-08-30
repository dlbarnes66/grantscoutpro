"use client"

import { useState } from "react";
import { OrgSettingsData } from "./types";

export default function OrgSettings() {
  const [settings, setSettings] = useState<OrgSettingsData>({
    orgName: "GrantDynamics",
    timezone: "America/Chicago",
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Organization Settings
      </h2>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400">Organization Name</label>
          <input
            value={settings.orgName}
            onChange={(e) =>
              setSettings({ ...settings, orgName: e.target.value })
            }
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) =>
              setSettings({ ...settings, timezone: e.target.value })
            }
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          >
            <option value="America/Chicago">Central Time</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
          </select>
        </div>
      </div>

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Save Organization Settings
      </button>
    </div>
  );
}

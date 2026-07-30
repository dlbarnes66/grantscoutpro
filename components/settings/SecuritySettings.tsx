"use client";

import { useState } from "react";
import { SecuritySettingsData } from "./types";

export default function SecuritySettings() {
  const [security, setSecurity] = useState<SecuritySettingsData>({
    password: "",
    twoFA: false,
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Security Settings
      </h2>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400">New Password</label>
          <input
            type="password"
            value={security.password}
            onChange={(e) =>
              setSecurity({ ...security, password: e.target.value })
            }
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={security.twoFA}
            onChange={() =>
              setSecurity({ ...security, twoFA: !security.twoFA })
            }
          />
          Enable Two‑Factor Authentication
        </label>
      </div>

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Update Security Settings
      </button>
    </div>
  );
}

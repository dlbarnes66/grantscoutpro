"use client"

import { useState } from "react";
import { ThemePreferencesData } from "./types";

export default function ThemePreferences() {
  const [prefs, setPrefs] = useState<ThemePreferencesData>({
    theme: "dark",
    accent: "blue",
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Theme Preferences
      </h2>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400">Theme</label>
          <select
            value={prefs.theme}
            onChange={(e) =>
              setPrefs({ ...prefs, theme: e.target.value as ThemePreferencesData["theme"] })
            }
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-slate-400">Accent Color</label>
          <select
            value={prefs.accent}
            onChange={(e) =>
              setPrefs({
                ...prefs,
                accent: e.target.value as ThemePreferencesData["accent"],
              })
            }
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          >
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="green">Green</option>
            <option value="gold">Gold</option>
          </select>
        </div>
      </div>

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Save Theme
      </button>
    </div>
  );
}

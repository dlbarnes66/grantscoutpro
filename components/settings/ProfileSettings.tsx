"use client";

import { useState } from "react";
import { ProfileSettingsData } from "./types";

export default function ProfileSettings() {
  const [profile, setProfile] = useState<ProfileSettingsData>({
    name: "Darryl Barnes",
    email: "darryl@example.com",
  });

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        Profile Settings
      </h2>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400">Name</label>
          <input
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Email</label>
          <input
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
            className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Save Profile
      </button>
    </div>
  );
}

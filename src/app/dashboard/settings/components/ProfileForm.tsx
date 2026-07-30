"use client";

import { useState, useEffect } from "react";

export function ProfileForm({ profile }: any) {
  const [name, setName] = useState(profile?.name || "");
  const [organizationName, setOrganizationName] = useState(
    profile?.profile?.organizationName || ""
  );
  const [mission, setMission] = useState(profile?.profile?.mission || "");
  const [website, setWebsite] = useState(profile?.profile?.website || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setOrganizationName(profile.profile?.organizationName || "");
      setMission(profile.profile?.mission || "");
      setWebsite(profile.profile?.website || "");
    }
  }, [profile]);

  async function save() {
    setSaving(true);

    await fetch("/api/settings/update-profile", {
      method: "POST",
      body: JSON.stringify({
        name,
        organizationName,
        mission,
        website,
      }),
    });

    setSaving(false);
    alert("Profile updated!");
  }

  return (
    <div className="border rounded p-6 space-y-4">
      <h2 className="text-xl font-semibold">Profile Information</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="w-full border rounded px-3 py-2"
      />

      <input
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
        placeholder="Organization name"
        className="w-full border rounded px-3 py-2"
      />

      <textarea
        value={mission}
        onChange={(e) => setMission(e.target.value)}
        placeholder="Mission"
        className="w-full border rounded px-3 py-2 h-32"
      />

      <input
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        placeholder="Website"
        className="w-full border rounded px-3 py-2"
      />

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}

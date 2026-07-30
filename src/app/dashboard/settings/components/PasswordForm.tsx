"use client";

import { useState } from "react";

export function PasswordForm() {
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    await fetch("/api/settings/update-password", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    setSaving(false);
    alert("Password updated!");
  }

  return (
    <div className="border rounded p-6 space-y-4">
      <h2 className="text-xl font-semibold">Change Password</h2>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="w-full border rounded px-3 py-2"
      />

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {saving ? "Saving..." : "Update Password"}
      </button>
    </div>
  );
}

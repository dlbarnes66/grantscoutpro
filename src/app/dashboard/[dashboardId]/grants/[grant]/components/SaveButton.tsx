"use client";

import { useState } from "react";

export function SaveButton({ grantId }: { grantId: string }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    try {
      setSaving(true);

      const res = await fetch("/api/grant/save", {
        method: "POST",
        body: JSON.stringify({ grantId }),
      });

      if (!res.ok) throw new Error("Failed to save grant");

      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <button
      onClick={save}
      disabled={saving}
      className={`px-4 py-2 rounded text-sm font-semibold ${
        saved
          ? "bg-green-600 text-white"
          : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {saving ? "Saving..." : saved ? "Saved" : "Save Grant"}
    </button>
  );
}

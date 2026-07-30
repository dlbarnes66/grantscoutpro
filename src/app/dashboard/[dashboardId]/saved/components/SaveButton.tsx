"use client";

import { useState, useEffect } from "react";

export function SaveButton({ grantId }: { grantId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await fetch(`/api/saved`);
      const data = await res.json();
      setSaved(data.some((g: any) => g.id === grantId));
    }
    check();
  }, [grantId]);

  async function toggle() {
    if (saved) {
      await fetch(`/api/unsave-grant/${grantId}`, { method: "POST" });
      setSaved(false);
    } else {
      await fetch(`/api/save-grant/${grantId}`, { method: "POST" });
      setSaved(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`px-4 py-2 rounded ${
        saved ? "bg-green-600 text-white" : "bg-gray-200"
      }`}
    >
      {saved ? "Saved" : "Save Grant"}
    </button>
  );
}

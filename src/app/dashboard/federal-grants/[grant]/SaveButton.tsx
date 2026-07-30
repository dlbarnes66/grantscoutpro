"use client";

import { useTransition } from "react";

export default function SaveButton({ grantId }) {
  const [pending, start] = useTransition();

  async function save() {
    start(async () => {
      await fetch("/api/save-grant", {
        method: "POST",
        body: JSON.stringify({ grantId }),
      });
    });
  }

  return (
    <button
      onClick={save}
      disabled={pending}
      className="px-4 py-2 bg-brandBlue text-white rounded"
    >
      {pending ? "Saving..." : "Save Grant"}
    </button>
  );
}

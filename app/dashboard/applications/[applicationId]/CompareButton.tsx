"use client";

import { useTransition } from "react";

export default function CompareButton({ grantId }) {
  const [pending, start] = useTransition();

  async function addToCompare() {
    start(async () => {
      await fetch("/api/compare-grant", {
        method: "POST",
        body: JSON.stringify({ grantId }),
      });
    });
  }

  return (
    <button
      onClick={addToCompare}
      disabled={pending}
      className="px-4 py-2 bg-gray-700 text-white rounded"
    >
      {pending ? "Adding..." : "Compare"}
    </button>
  );
}

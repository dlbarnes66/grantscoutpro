"use client";

import { useEffect, useState } from "react";
import { CompareTable } from "./components/CompareTable";

export default function ComparePage({ params }: { params: { workspaceId: string } }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      // ⭐ Correct param name
      const res = await fetch(`/api/compare/${workspaceId}`);
      const json = await res.json();
      setData(json);
    }
    load();
  }, [workspaceId]);

  if (!data) {
    return <p className="p-6">Loading comparison...</p>;
  }

  return (
    <div>
      <button
        onClick={async () => {
          await fetch(`/api/compare/clear/${workspaceId}`, { method: "POST" });
          location.reload();
        }}
        className="ml-6 mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Clear Comparison
      </button>

      <CompareTable grants={data.grants} />
    </div>
  );
}

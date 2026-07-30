"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function Filters({ agencies, categories }) {
  const router = useRouter();
  const params = useSearchParams();

  function updateFilter(key, value) {
    const newParams = new URLSearchParams(params.toString());
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    router.push(`/dashboard/federal-grants?${newParams.toString()}`);
  }

  return (
    <div className="p-4 border rounded bg-white space-y-4">
      <input
        type="text"
        placeholder="Search grants..."
        defaultValue={params.get("q") ?? ""}
        onChange={(e) => updateFilter("q", e.target.value)}
        className="w-full border p-2 rounded"
      />

      <select
        defaultValue={params.get("agency") ?? ""}
        onChange={(e) => updateFilter("agency", e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">All Agencies</option>
        {agencies.map((a) => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>

      <select
        defaultValue={params.get("category") ?? ""}
        onChange={(e) => updateFilter("category", e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

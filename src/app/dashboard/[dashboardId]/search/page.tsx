"use client";

import React, { useState } from "react";

export default function SearchPage({ params }: { params: { workspaceId: string } }) {
  const [grants, setGrants] = useState([]);

  async function handleSearch(query: string) {
    const res = await fetch(`/api/search/${params.workspaceId}?q=${query}`);
    const data = await res.json();
    setGrants(data);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-100 mb-4">Search Grants</h1>

      <input
        type="text"
        placeholder="Search..."
        className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-slate-200 w-full"
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="mt-6 space-y-3">
        {grants.map((grant: any) => (
          <div key={grant.id} className="rounded bg-slate-800 p-4">
            <div className="text-slate-100 font-medium">{grant.title}</div>
            <div className="text-slate-400 text-sm">{grant.agency}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import AddonCard from "./AddonCard";

export default function AddonsPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const workspaceId = params.workspaceId;

  const [addons, setAddons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/workspace/${workspaceId}/addons`);
      const json = await res.json();
      setAddons(json.addons || []);
      setLoading(false);
    }
    load();
  }, [workspaceId]);

  if (loading) {
    return <p className="p-6 text-lg">Loading add-ons...</p>;
  }

  return (
    <div className="space-y-8 p-6">
      <h1 className="text-3xl font-bold">Add‑Ons & Upgrades</h1>

      <p className="text-gray-700">
        Enhance your workspace with powerful add‑ons. Activate or purchase new features instantly.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addons.map((addon) => (
          <AddonCard
            key={addon.id}
            addon={addon}
            workspaceId={workspaceId}
          />
        ))}
      </div>
    </div>
  );
}

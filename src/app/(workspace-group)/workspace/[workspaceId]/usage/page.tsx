"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";

export default function UsagePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/usage`);
      const json = await res.json();
      setUsage(json.usage);
      setLoading(false);
    };

    load();
  }, [workspaceId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Usage</h1>

      {loading && <p>Loading...</p>}

      {usage && (
        <div className="border rounded-lg p-4 bg-white shadow-sm space-y-3">
          <p className="text-lg font-semibold">Searches: {usage.searches}</p>
          <p className="text-lg font-semibold">Uploads: {usage.uploads}</p>
          <p className="text-lg font-semibold">Members: {usage.members}</p>
          <p className="text-lg font-semibold">AI Messages: {usage.ai}</p>
        </div>
      )}
    </div>
  );
}

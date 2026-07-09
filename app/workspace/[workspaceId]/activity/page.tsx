"use client";

import { useEffect, useState } from "react";
import ActivityItem from "@/components/workspace/activity/ActivityItem";

export default function ActivityFeedPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/activity`);
      const json = await res.json();
      setActivity(json.activity || []);
      setLoading(false);
    };

    load();
  }, [workspaceId]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Workspace Activity</h1>

      {loading && <p className="text-gray-600">Loading...</p>}

      <div className="space-y-4">
        {activity.map((item) => (
          <ActivityItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

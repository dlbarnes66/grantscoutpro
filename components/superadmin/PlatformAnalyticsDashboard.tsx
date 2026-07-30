"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { PlatformAnalyticsStats } from "./types";

export default function PlatformAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformAnalyticsStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/superadmin/platform-analytics");
        const data = await res.json();
        setStats(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold">Platform Analytics</h3>
        <p className="text-gray-500">No analytics data available.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-xl font-semibold">Platform Analytics</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Active Workspaces</p>
          <p className="text-2xl font-bold">{stats.activeWorkspaces}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Documents</p>
          <p className="text-2xl font-bold">{stats.documents}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">AI Requests</p>
          <p className="text-2xl font-bold">{stats.aiRequests}</p>
        </div>
      </div>
    </Card>
  );
}

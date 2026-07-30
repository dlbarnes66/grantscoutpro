"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Loader2 } from "lucide-react";
import { AiUsageStats } from "./types";

export default function AiUsageMonitor() {
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<AiUsageStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/superadmin/ai-usage");
        const data = await res.json();
        setUsage(data);
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

  if (!usage) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold">AI Usage Monitor</h3>
        <p className="text-gray-500">No usage data available.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-xl font-semibold">AI Usage Monitor</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Total AI Requests</p>
          <p className="text-2xl font-bold">{usage.totalRequests}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Tokens Used</p>
          <p className="text-2xl font-bold">{usage.totalTokens}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-2xl font-bold">{usage.activeUsers}</p>
        </div>
      </div>
    </Card>
  );
}

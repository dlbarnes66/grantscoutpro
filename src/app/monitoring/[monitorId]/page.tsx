import React from "react";
import { prisma } from "@/lib/prisma";

export default async function MonitoringPage({
  params
}: {
  params: { monitorId: string };
}) {
  const monitorId = params.monitorId;

  const insights = await prisma.monitoringHistory.findMany({
    where: { grantId: monitorId },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monitoring Insights</h1>

      <InsightsList insights={insights} />
    </div>
  );
}

function InsightsList({ insights }: { insights: any[] }) {
  return (
    <div className="space-y-4">
      {insights.map((item) => (
        <InsightCard key={item.id} insights={item} />
      ))}
    </div>
  );
}

function InsightCard({ insights }: { insights: any }) {
  return (
    <div className="border p-4 rounded-md shadow-sm">
      <h2 className="font-semibold">{insights.monitoring}</h2>
      <p className="text-sm text-gray-600">{insights.notes}</p>
      <p className="text-xs text-gray-400 mt-2">
        {new Date(insights.createdAt).toLocaleString()}
      </p>
    </div>
  );
}

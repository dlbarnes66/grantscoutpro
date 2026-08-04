"use client";

export default function AIMonitoringInsights({ insights }: { insights: any }) {
  if (!insights) {
    return (
      <div className="p-4 text-gray-500">
        No AI insights available for this monitor yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">AI Monitoring Insights</h2>

      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <p className="text-gray-700">{insights.summary}</p>

        <ul className="mt-3 list-disc list-inside text-gray-600">
          {insights.points?.map((p: string, i: number) => (
            <li key={i}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

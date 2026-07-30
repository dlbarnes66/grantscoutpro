"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";
import { FileText, Search, Sparkles, UploadCloud } from "lucide-react";

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Load workspace metrics
      const res = await fetch("/api/dashboard/metrics");
      const data = await res.json();

      if (res.ok) {
        setMetrics(data.metrics);
        setInsights(data.insights || []);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="p-6 text-gray-600">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Home</h1>
        <p className="text-gray-600 mt-1">
          Welcome back — here’s what’s happening in your workspace.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Documents</div>
          <div className="text-3xl font-bold mt-1">{metrics.documents}</div>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Grants</div>
          <div className="text-3xl font-bold mt-1">{metrics.grants}</div>
        </div>

        <div className="p-6 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Matches</div>
          <div className="text-3xl font-bold mt-1">{metrics.matches}</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <a
            href="/upload"
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
          >
            <UploadCloud className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Upload Document</span>
          </a>

          <a
            href="/search"
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
          >
            <Search className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Search Grants</span>
          </a>

          <a
            href="/matching"
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
          >
            <Sparkles className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Run Matching</span>
          </a>

          <a
            href="/saved-grants"
            className="p-4 border rounded-lg hover:bg-gray-50 flex flex-col items-center"
          >
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Saved Grants</span>
          </a>
        </div>
      </div>

      {/* AI Insights */}
      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          AI Insights
        </h2>

        {insights.length === 0 ? (
          <p className="text-gray-600">No insights available yet.</p>
        ) : (
          <ul className="space-y-3">
            {insights.map((insight, idx) => (
              <li
                key={idx}
                className="p-4 border rounded-lg bg-gray-50 text-gray-800"
              >
                {insight}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

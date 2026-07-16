"use client";

import { useJobs } from "@/hooks/useJobs";
import { Clock, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

export default function JobsPage() {
  const { jobs, loading } = useJobs();

  function statusIcon(status: string) {
    switch (status) {
      case "queued":
        return <Clock className="w-5 h-5 text-gray-500" />;
      case "running":
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "failed":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading jobs…
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Jobs
        </h1>
      </div>

      {/* Empty State */}
      {jobs.length === 0 && (
        <div className="p-6 bg-white border rounded-xl shadow-sm text-gray-600">
          No jobs have been created yet.
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="p-5 bg-white border rounded-xl shadow-sm flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                {statusIcon(job.status)}
                {job.text}
              </div>

              <div className="text-gray-600 text-sm mt-1">
                {new Date(job.createdAt).toLocaleString()}
              </div>
            </div>

            {/* No retry button because your backend does not support retry */}
          </div>
        ))}
      </div>
    </div>
  );
}

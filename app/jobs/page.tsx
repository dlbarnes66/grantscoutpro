"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchJobs() {
    const res = await fetch("/api/jobs", {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setJobs(data.jobs || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchJobs();

    // Auto-refresh every 5 seconds
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading jobs…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Your Jobs</h1>

        {jobs.length === 0 ? (
          <p className="text-gray-600">No jobs yet. Try running a search.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                className="block p-4 border rounded-lg bg-white hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{job.text}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(job.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded text-white text-sm ${
                      job.status === "completed"
                        ? "bg-green-600"
                        : job.status === "failed"
                        ? "bg-red-600"
                        : job.status === "cancelled"
                        ? "bg-gray-500"
                        : "bg-blue-600"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

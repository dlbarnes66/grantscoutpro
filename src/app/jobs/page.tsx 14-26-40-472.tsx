"use client";

import { useEffect, useState } from "react";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Job Status</h1>

      {jobs.map((job) => (
        <div key={job.id} className="p-4 bg-white shadow rounded">
          <p className="font-semibold">{job.text}</p>
          <p className="text-sm text-gray-600">{job.status}</p>

          <a
            href={`/jobs/${job.id}`}
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            View Details
          </a>
        </div>
      ))}
    </div>
  );
}

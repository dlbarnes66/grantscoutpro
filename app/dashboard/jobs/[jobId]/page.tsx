"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function DashboardJobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      const res = await fetch(`/api/jobs/${id}`);
      const data = await res.json();
      setJob(data);
      setLoading(false);
    };

    loadJob();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading job details…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center text-red-600 text-lg py-20">
        Job not found.
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
        <p className="text-muted mt-2">
          Track the status and output of this AI‑powered task.
        </p>
      </div>

      {/* Job Metadata */}
      <div className="card">
        <h2 className="section-title">Job Information</h2>

        <div className="mt-4 space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Type:</span>{" "}
            {job.type || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={
                job.status === "completed"
                  ? "text-green-600"
                  : job.status === "failed"
                  ? "text-red-600"
                  : "text-blue-600"
              }
            >
              {job.status}
            </span>
          </p>

          <p>
            <span className="font-semibold">Created:</span>{" "}
            {new Date(job.createdAt).toLocaleString()}
          </p>

          {job.updatedAt && (
            <p>
              <span className="font-semibold">Updated:</span>{" "}
              {new Date(job.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Job Output */}
      <div className="card">
        <h2 className="section-title">Output</h2>

        {!job.output && (
          <p className="text-muted mt-2">
            No output available yet.
          </p>
        )}

        {job.output && (
          <textarea
            className="textarea mt-4 w-full h-96"
            value={job.output}
            readOnly
          />
        )}
      </div>

      {/* Logs */}
      <div className="card">
        <h2 className="section-title">Logs</h2>

        {!job.logs || job.logs.length === 0 ? (
          <p className="text-muted mt-2">No logs available.</p>
        ) : (
          <pre className="mt-4 bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-sm leading-relaxed">
            {job.logs.join("\n")}
          </pre>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        {job.status === "failed" && (
          <button
            onClick={async () => {
              await fetch(`/api/jobs/${id}/retry`, { method: "POST" });
              location.reload();
            }}
            className="btn btn-secondary"
          >
            Retry Job
          </button>
        )}

        <button
          onClick={async () => {
            await fetch(`/api/jobs/${id}/delete`, { method: "POST" });
            window.location.href = "/dashboard/jobs";
          }}
          className="btn btn-danger"
        >
          Delete Job
        </button>

        <Link href="/dashboard/jobs" className="btn btn-primary">
          Back to Jobs
        </Link>
      </div>
    </div>
  );
}

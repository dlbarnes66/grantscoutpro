"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function ApplyNowPage() {
  const { id } = useParams();
  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const loadGrant = async () => {
      const res = await fetch(`/api/grants/${id}`);
      const data = await res.json();
      setGrant(data);
      setLoading(false);
    };

    loadGrant();
  }, [id]);

  const startApplication = async () => {
    setStarting(true);

    const res = await fetch("/api/applications/start", {
      method: "POST",
      body: JSON.stringify({ grantId: id }),
    });

    const data = await res.json();

    window.location.href = `/dashboard/applications/${data.applicationId}`;
  };

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading application…
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="text-center text-red-600 text-lg py-20">
        Grant not found.
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Apply for {grant.title}
        </h1>
        <p className="text-muted mt-2">
          Start your application and track your progress step‑by‑step.
        </p>
      </div>

      {/* Grant Summary */}
      <div className="card">
        <h2 className="section-title">Grant Overview</h2>

        <p className="text-gray-700 mt-2 leading-relaxed">
          {grant.summary || "No summary available."}
        </p>

        <div className="mt-4 space-y-1 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Amount:</span> {grant.amount || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Deadline:</span> {grant.deadline || "N/A"}
          </p>
        </div>
      </div>

      {/* Start Application */}
      <div className="card">
        <h2 className="section-title">Start Application</h2>
        <p className="text-muted mt-2">
          Begin a new application for this grant. You can save progress and return anytime.
        </p>

        <button
          onClick={startApplication}
          disabled={starting}
          className="btn btn-primary mt-6"
        >
          {starting ? "Starting…" : "Start Application"}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 flex gap-4">
        <Link href={`/dashboard/grants/${id}`} className="btn btn-secondary">
          Back to Grant
        </Link>

        <Link href="/dashboard" className="btn btn-success">
          Dashboard Home
        </Link>
      </div>
    </div>
  );
}

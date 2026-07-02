"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function DashboardApplyPage() {
  const { id } = useParams();
  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const loadGrant = async () => {
      const res = await fetch(`/api/grants/${id}`);
      const data = await res.json();
      setGrant(data);
      setLoading(false);
    };

    loadGrant();
  }, [id]);

  const submitApplication = async () => {
    setSubmitting(true);

    await fetch("/api/apply", {
      method: "POST",
      body: JSON.stringify({
        grantId: id,
        notes,
      }),
    });

    setSubmitting(false);
    alert("Application submitted!");
  };

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading application form…
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
        <h1 className="text-3xl font-bold text-gray-900">Apply to Grant</h1>
        <p className="text-muted mt-2">
          Submit your application or attach notes for internal tracking.
        </p>
      </div>

      {/* Grant Summary */}
      <div className="card">
        <h2 className="section-title">Grant Overview</h2>

        <h3 className="text-xl font-semibold mt-4">{grant.title}</h3>
        {grant.agency && (
          <p className="text-muted mt-1">{grant.agency}</p>
        )}

        <div className="mt-4 space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Amount:</span>{" "}
            {grant.amount || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Deadline:</span>{" "}
            {grant.deadline || "N/A"}
          </p>
        </div>
      </div>

      {/* Notes / Application */}
      <div className="card">
        <h2 className="section-title">Application Notes</h2>
        <p className="text-muted mt-2">
          Add internal notes, draft responses, or attach context for your team.
        </p>

        <textarea
          className="textarea mt-4 w-full h-64"
          placeholder="Write your notes here…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={submitApplication}
          disabled={submitting}
          className="btn btn-primary"
        >
          {submitting ? "Submitting…" : "Submit Application"}
        </button>

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

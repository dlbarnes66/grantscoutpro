"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function DashboardGrantDetails() {
  const { id } = useParams();
  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrant = async () => {
      const res = await fetch(`/api/grants/${id}`);
      const data = await res.json();
      setGrant(data);
      setLoading(false);
    };

    loadGrant();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading grant details…
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
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          {grant.title}
        </h1>
        {grant.agency && (
          <p className="text-muted mt-1">{grant.agency}</p>
        )}
      </div>

      {/* Metadata */}
      <div className="card">
        <h2 className="section-title">Grant Details</h2>

        <div className="mt-4 space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Amount:</span>{" "}
            {grant.amount || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Deadline:</span>{" "}
            {grant.deadline || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Category:</span>{" "}
            {grant.category || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Eligibility:</span>{" "}
            {grant.eligibility || "N/A"}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h2 className="section-title">Summary</h2>
        <p className="text-gray-700 leading-relaxed mt-2">
          {grant.summary || "No summary available."}
        </p>
      </div>

      {/* Description */}
      {grant.description && (
        <div className="card">
          <h2 className="section-title">Full Description</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line mt-2">
            {grant.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <Link
          href={`/dashboard/grants/${id}/write`}
          className="btn btn-primary"
        >
          Write Proposal with AI
        </Link>

        <Link
          href="/dashboard/compare"
          className="btn btn-secondary"
        >
          Compare Grants
        </Link>

        <Link
          href="/dashboard/search"
          className="btn btn-success"
        >
          Back to Search
        </Link>
      </div>
    </div>
  );
}

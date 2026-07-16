"use client";

import { useParams } from "next/navigation";
import { useGrant } from "@/hooks/useGrant";
import { ExternalLink, BookmarkPlus, Scale } from "lucide-react";

export default function GrantDetailsPage() {
  const params = useParams();
  const grantId = params.grantId as string;

  const { grant, loading } = useGrant(grantId);

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading grant…
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="p-6 text-gray-600">
        Grant not found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{grant.title}</h1>
        <p className="text-gray-600 mt-1">{grant.funder}</p>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Amount</div>
          <div className="text-xl font-semibold mt-1">
            {grant.amount ? `$${grant.amount}` : "N/A"}
          </div>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Deadline</div>
          <div className="text-xl font-semibold mt-1">
            {grant.deadline
              ? new Date(grant.deadline).toLocaleDateString()
              : "N/A"}
          </div>
        </div>

        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-gray-500 text-sm">Grant ID</div>
          <div className="text-xl font-semibold mt-1">{grant.id}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Summary
        </h2>
        <p className="text-gray-700 leading-relaxed">{grant.summary}</p>
      </div>

      {/* Eligibility */}
      <div className="p-6 bg-white border rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Eligibility
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {grant.eligibility || "No eligibility information available."}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {grant.url && (
          <a
            href={grant.url}
            target="_blank"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Source
          </a>
        )}

        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
          <BookmarkPlus className="w-4 h-4" />
          Save Grant
        </button>

        <a
          href={`/compare?ids=${grant.id}`}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black flex items-center gap-2"
        >
          <Scale className="w-4 h-4" />
          Compare
        </a>
      </div>
    </div>
  );
}

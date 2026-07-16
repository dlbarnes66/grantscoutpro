"use client";

import { useSearchParams } from "next/navigation";
import { useCompare } from "@/hooks/useCompare";
import { Scale, ExternalLink, BookmarkPlus } from "lucide-react";

export default function ComparePage() {
  const params = useSearchParams();
  const grantIds = params.get("ids")
    ? params.get("ids")!.split(",")
    : [];

  const { grants, loading } = useCompare(grantIds);

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        Loading comparison…
      </div>
    );
  }

  if (grants.length === 0) {
    return (
      <div className="p-6 text-gray-600">
        No grants selected for comparison.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Scale className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Compare Grants
        </h1>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-4 text-left">Grant</th>
              {grants.map((g) => (
                <th key={g.id} className="border p-4 text-left">
                  {g.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Funder */}
            <tr>
              <td className="border p-4 font-medium">Funder</td>
              {grants.map((g) => (
                <td key={g.id} className="border p-4">
                  {g.funder}
                </td>
              ))}
            </tr>

            {/* Amount */}
            <tr>
              <td className="border p-4 font-medium">Amount</td>
              {grants.map((g) => (
                <td key={g.id} className="border p-4">
                  {g.amount ? `$${g.amount}` : "N/A"}
                </td>
              ))}
            </tr>

            {/* Deadline */}
            <tr>
              <td className="border p-4 font-medium">Deadline</td>
              {grants.map((g) => (
                <td key={g.id} className="border p-4">
                  {g.deadline
                    ? new Date(g.deadline).toLocaleDateString()
                    : "N/A"}
                </td>
              ))}
            </tr>

            {/* Summary */}
            <tr>
              <td className="border p-4 font-medium">Summary</td>
              {grants.map((g) => (
                <td key={g.id} className="border p-4 text-sm text-gray-700">
                  {g.summary || "No summary available"}
                </td>
              ))}
            </tr>

            {/* Eligibility */}
            <tr>
              <td className="border p-4 font-medium">Eligibility</td>
              {grants.map((g) => (
                <td key={g.id} className="border p-4 text-sm text-gray-700">
                  {g.eligibility || "No eligibility listed"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        {grants.map((g) => (
          <div key={g.id} className="flex gap-3">
            <a
              href={`/grants/${g.id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              View
            </a>

            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4" />
              Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

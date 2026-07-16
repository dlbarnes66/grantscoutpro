"use client";

import { useGrantMatching } from "@/hooks/useGrantMatching";
import { FileText } from "lucide-react";
import Link from "next/link";

export default function GrantMatchingResults() {
  const { results } = useGrantMatching();

  if (!results || results.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {results.map((r) => (
        <div
          key={r.id}
          className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-gray-400 mt-1" />

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {r.title || "Untitled Document"}
              </h3>

              {r.summary && (
                <p className="text-gray-700 mt-1">{r.summary}</p>
              )}

              <div className="text-sm text-gray-500 mt-2">
                Match Score: {(r.score * 100).toFixed(1)}%
              </div>

              <Link
                href={`/documents/${r.id}`}
                className="text-blue-600 text-sm hover:underline mt-2 inline-block"
              >
                View Document →
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

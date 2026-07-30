"use client";

import React from "react";

export function HistoryList({ history }: { history: any[] }) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Grant History</h2>

      {(!history || history.length === 0) && (
        <p className="text-sm text-gray-500">No history available.</p>
      )}

      <div className="space-y-3">
        {history.map((entry) => (
          <div
            key={`${entry.type}-${entry.createdAt}-${entry.data?.id ?? ""}`}
            className="rounded-md border border-gray-100 p-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">
                {entry.type.replace(/History$/, "")}
              </span>

              <span className="text-xs text-gray-400">
                {new Date(entry.createdAt).toLocaleString()}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-700">
              {entry.data?.notes ??
                entry.data?.action ??
                "No details available."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

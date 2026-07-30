"use client";

import React from "react";

export function DraftList({ drafts }: { drafts: any[] }) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Drafts</h2>

      {(!drafts || drafts.length === 0) && (
        <p className="text-sm text-gray-500">No drafts available.</p>
      )}

      <div className="space-y-3">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className="rounded-md border border-gray-100 p-3 hover:bg-gray-50 transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-800">
                {draft.title ?? "Untitled Draft"}
              </h3>
              <span className="text-xs text-gray-400">
                {new Date(draft.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {draft.content ?? "No content"}
            </p>

            <div className="mt-2 flex gap-2">
              <button className="rounded-md bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700">
                Open
              </button>
              <button className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

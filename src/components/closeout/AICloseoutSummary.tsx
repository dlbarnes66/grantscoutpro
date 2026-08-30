"use client";

import React from "react";

export default function AICloseoutSummary({
  onFinalizeAction,
  loading,
}: {
  onFinalizeAction?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="border rounded-md p-4 space-y-2">
      <p className="text-sm text-slate-400">
        AI closeout summary goes here. {loading ? "Loading…" : ""}
      </p>
      {onFinalizeAction && (
        <button
          className="mt-2 text-xs text-blue-500"
          onClick={onFinalizeAction}
        >
          Finalize
        </button>
      )}
    </div>
  );
}

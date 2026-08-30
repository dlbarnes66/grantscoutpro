"use client"

import { PaginationProps } from "./types";

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="btn btn-secondary disabled:opacity-40"
      >
        Previous
      </button>

      <span className="text-slate-400 text-sm">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="btn btn-secondary disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

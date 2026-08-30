"use client"

import { FolderIcon } from "@heroicons/react/24/outline";
import { EmptyStateProps } from "./types";

export default function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-20">
      <FolderIcon className="h-12 w-12 text-slate-500 mx-auto mb-6" />

      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6">{description}</p>

      {actionLabel && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}

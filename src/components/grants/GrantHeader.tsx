"use client"

import { BookmarkIcon } from "@heroicons/react/24/outline";
import { Grant } from "./types";

export function GrantHeader({ grant }: { grant: Grant }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          {grant.title}
        </h1>
        <p className="text-sm text-slate-400">{grant.agency}</p>
      </div>

      <button className="rounded-md p-2 hover:bg-slate-800 transition">
        <BookmarkIcon className="h-6 w-6 text-slate-300" />
      </button>
    </div>
  );
}

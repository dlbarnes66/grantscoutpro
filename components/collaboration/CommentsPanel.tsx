"use client";

import { useState } from "react";

export function CommentsPanel({ comments }: { comments: any[] }) {
  const [value, setValue] = useState("");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Comments
      </h2>

      <ul className="space-y-4 text-sm text-slate-300">
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg bg-slate-800 p-4 space-y-1">
            <div className="font-semibold text-slate-100">{c.author}</div>
            <div>{c.text}</div>
            <div className="text-xs text-slate-500">{c.timestamp}</div>
          </li>
        ))}
      </ul>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a comment..."
        className="w-full h-24 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      />

      <button className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium">
        Add Comment
      </button>
    </div>
  );
}

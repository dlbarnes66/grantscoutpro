"use client";

import React from "react";

export function NarrativeEditor({
  title = "",
  content = "",
  onChangeTitleAction,
  onChangeContentAction,
}: {
  title?: string;
  content?: string;
  onChangeTitleAction?: (value: string) => void;
  onChangeContentAction?: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <input
        className="w-full p-2 border rounded"
        value={title}
        onChange={(e) => onChangeTitleAction?.(e.target.value)}
        placeholder="Narrative title"
      />

      <textarea
        className="w-full p-3 border rounded min-h-[200px]"
        value={content}
        onChange={(e) => onChangeContentAction?.(e.target.value)}
        placeholder="Narrative content…"
      />
    </div>
  );
}

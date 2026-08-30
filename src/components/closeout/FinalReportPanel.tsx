"use client";

import React from "react";

export function FinalReportPanel({
  title = "",
  content = "",
  onChangeAction,
}: {
  title?: string;
  content?: string;
  onChangeAction?: (updated: { title: string; content: string }) => void;
}) {
  const update = (field: string, value: string) => {
    onChangeAction?.({
      title: field === "title" ? value : title,
      content: field === "content" ? value : content,
    });
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full p-2 border rounded"
        value={title}
        onChange={(e) => update("title", e.target.value)}
        placeholder="Final report title"
      />

      <textarea
        className="w-full p-3 border rounded min-h-[150px]"
        value={content}
        onChange={(e) => update("content", e.target.value)}
        placeholder="Final report content…"
      />
    </div>
  );
}

"use client";

import React from "react";

export function SectionEditor({
  sections = [],
  onChangeAction,
}: {
  sections?: Array<{ id: string; title: string; content: string }>;
  onChangeAction?: (updated: any[]) => void;
}) {
  const update = (id: string, field: string, value: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, [field]: value } : s
    );
    onChangeAction?.(updated);
  };

  return (
    <div className="space-y-4">
      {sections.map((s) => (
        <div key={s.id} className="border p-4 rounded">
          <input
            className="w-full mb-2 p-2 border rounded"
            value={s.title}
            onChange={(e) => update(s.id, "title", e.target.value)}
            placeholder="Section title"
          />

          <textarea
            className="w-full p-3 border rounded min-h-[150px]"
            value={s.content}
            onChange={(e) => update(s.id, "content", e.target.value)}
            placeholder="Section content…"
          />
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

export function SectionEditor({
  section,
  onChange
}: {
  section: any;
  onChange: (content: string) => void;
}) {
  const [value, setValue] = useState(section.content);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(section.content);
  }, [section.id]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSaving(true);
      onChange(value);
      setTimeout(() => setSaving(false), 400);
    }, 500);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          {section.title}
        </h2>

        <div className="text-xs text-slate-400">
          {saving ? "Saving..." : "Saved"}
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full h-64 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
        placeholder={`Write the ${section.title.toLowerCase()}...`}
      />
    </div>
  );
}

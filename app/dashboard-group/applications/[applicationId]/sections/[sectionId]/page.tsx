"use client";

import { useEffect, useState } from "react";

export default function SectionEditorPage({ params }: any) {
  const { appId, sectionId } = params;

  const [section, setSection] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/applications/section", {
        method: "POST",
        body: JSON.stringify({ sectionId }),
      });

      const data = await res.json();
      setSection(data.section);
    }

    load();
  }, [sectionId]);

  async function save() {
    setSaving(true);

    await fetch("/api/applications/section/save", {
      method: "POST",
      body: JSON.stringify({
        sectionId,
        content: section.content,
      }),
    });

    setSaving(false);
  }

  if (!section) return <div className="p-6">Loading section…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{section.title}</h1>

      <textarea
        className="w-full border rounded p-3 h-96"
        value={section.content}
        onChange={(e) =>
          setSection({ ...section, content: e.target.value })
        }
      />

      <button
        onClick={save}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? "Saving…" : "Save Section"}
      </button>
    </div>
  );
}

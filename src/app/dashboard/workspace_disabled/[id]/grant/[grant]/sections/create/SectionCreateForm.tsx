"use client";

import { useState } from "react";

export default function SectionCreateForm({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdSectionId, setCreatedSectionId] = useState<string | null>(null);

  async function createSection() {
    setCreating(true);

    const res = await fetch("/api/grants/sections/create", {
      method: "POST",
      body: JSON.stringify({
        grantId,
        title,
        purpose,
        useAI
      }),
    });

    const data = await res.json();
    setCreating(false);

    if (data.success) {
      setCreatedSectionId(data.section.id);
    }
  }

  if (createdSectionId) {
    return (
      <div className="p-4 border rounded-md bg-green-50">
        <h2 className="text-xl font-semibold">Section Created Successfully</h2>
        <p className="mt-2">Your section has been created.</p>

        <a
          href={`/dashboard/workspace/${workspaceId}/grant/${grantId}/sections/${createdSectionId}`}
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Open Section
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <div className="space-y-2">
        <label className="font-medium">Section Title</label>
        <input
          type="text"
          className="w-full p-3 border rounded-md"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Project Description"
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium">Purpose</label>
        <textarea
          className="w-full p-3 border rounded-md h-32"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Describe the purpose of this section..."
        />
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={useAI}
          onChange={() => setUseAI(!useAI)}
        />
        <span>Use AI to generate a section template</span>
      </label>

      <button
        onClick={createSection}
        disabled={creating || !title}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {creating ? "Creating..." : "Create Section"}
      </button>
    </div>
  );
}

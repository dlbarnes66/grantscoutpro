"use client";

import { useState, useEffect } from "react";

export default function NarrativeBuilder({
  sectionId,
  workspaceId,
  grantId,
  initialContent,
  initialInstructions
}: {
  sectionId: string;
  workspaceId: string;
  grantId: string;
  initialContent: string;
  initialInstructions?: string;
}) {
  const [sectionText, setSectionText] = useState(initialContent || "");
  const [instructions, setInstructions] = useState(initialInstructions || "");
  const [aiDraft, setAIDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);

  // Load previous versions from backend
  useEffect(() => {
    async function loadVersions() {
      const res = await fetch(`/api/sections/${sectionId}/versions`);
      const data = await res.json();
      setVersions(data.versions || []);
    }
    loadVersions();
  }, [sectionId]);

  async function generateDraft() {
    setLoading(true);

    const res = await fetch("/api/ai/narrative", {
      method: "POST",
      body: JSON.stringify({
        sectionId,
        workspaceId,
        grantId,
        sectionText,
        instructions
      }),
    });

    const data = await res.json();
    setAIDraft(data.output);
    setLoading(false);
  }

  async function acceptDraft() {
    if (!aiDraft) return;

    setSaving(true);

    const res = await fetch(`/api/sections/${sectionId}/save`, {
      method: "POST",
      body: JSON.stringify({
        newContent: aiDraft
      }),
    });

    const data = await res.json();

    // Update UI
    setSectionText(aiDraft);
    setVersions(data.versions || []);
    setAIDraft("");
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      {/* Section Editor */}
      <div>
        <h2 className="text-xl font-semibold">Section Content</h2>
        <textarea
          className="w-full h-64 p-3 border rounded-md"
          value={sectionText}
          onChange={(e) => setSectionText(e.target.value)}
        />
      </div>

      {/* Instructions */}
      <div>
        <h2 className="text-xl font-semibold">AI Instructions</h2>
        <textarea
          className="w-full h-32 p-3 border rounded-md"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Tell the AI how you want this section rewritten..."
        />
      </div>

      {/* Generate Draft Button */}
      <button
        onClick={generateDraft}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Generating..." : "Generate AI Draft"}
      </button>

      {/* AI Draft Panel */}
      {aiDraft && (
        <div className="p-4 border rounded-md bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">AI Draft</h2>
          <p className="whitespace-pre-wrap">{aiDraft}</p>

          <button
            onClick={acceptDraft}
            disabled={saving}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md"
          >
            {saving ? "Saving..." : "Accept Draft"}
          </button>
        </div>
      )}

      {/* Version History */}
      <div>
        <h2 className="text-xl font-semibold">Version History</h2>
        <div className="space-y-3">
          {versions.map((v, i) => (
            <div key={i} className="p-3 border rounded-md bg-white">
              <h3 className="font-medium">Version {i + 1}</h3>
              <p className="whitespace-pre-wrap">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

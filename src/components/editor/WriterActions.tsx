"use client";

import { useState } from "react";
import { useWriter } from "@/hooks/useWriter";
import type { WriterTool } from "@/lib/writer/client";

interface WriterActionsProps {
  workspaceId: string;
  documentId: string;
  getSelectedText: () => string;
  insertText: (text: string) => void;
}

const TOOLS: { label: string; tool: WriterTool }[] = [
  { label: "Rewrite", tool: "rewrite" },
  { label: "Expand", tool: "expand" },
  { label: "Summarize", tool: "summarize" },
  { label: "Improve", tool: "improve" },
  { label: "Clarify", tool: "clarify" },
  { label: "Shorten", tool: "shorten" },
  { label: "Tone Style", tool: "tone-style" },

  { label: "Budget Justification", tool: "budget-justification" },
  { label: "Compliance", tool: "compliance" },
  { label: "Full Proposal", tool: "full-proposal" },
  { label: "Narrative", tool: "narrative" },
  { label: "Revision", tool: "revision" },
  { label: "Section Writer", tool: "section" }
];

export function WriterActions({
  workspaceId,
  documentId,
  getSelectedText,
  insertText
}: WriterActionsProps) {
  const { runWriter, loading, error } = useWriter(workspaceId, documentId);
  const [activeTool, setActiveTool] = useState<WriterTool | null>(null);

  async function handleTool(tool: WriterTool) {
    const selected = getSelectedText();

    if (!selected || selected.trim().length === 0) {
      alert("Please select text in the editor first.");
      return;
    }

    setActiveTool(tool);

    try {
      const output = await runWriter(tool, selected);
      insertText(output);
    } catch {
      // error handled by hook
    } finally {
      setActiveTool(null);
    }
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
      {TOOLS.map(({ label, tool }) => (
        <button
          key={tool}
          onClick={() => handleTool(tool)}
          disabled={loading}
          className={`px-3 py-1 rounded border text-sm ${
            activeTool === tool
              ? "bg-blue-600 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          {label}
        </button>
      ))}

      {loading && (
        <span className="text-blue-600 font-medium ml-2">
          Running {activeTool}…
        </span>
      )}

      {error && (
        <span className="text-red-600 font-medium ml-2">
          {error}
        </span>
      )}
    </div>
  );
}

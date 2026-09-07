"use client";

import { useState } from "react";

type SectionType =
  | "outline"
  | "needs"
  | "goals"
  | "methodology"
  | "evaluation"
  | "budget"
  | "custom";

const SECTION_CONFIG: Record<
  Exclude<SectionType, "custom">,
  { label: string; endpoint: string; prompt: string }
> = {
  outline: {
    label: "Outline",
    endpoint: "/api/writer/full-proposal",
    prompt:
      "Generate a complete outline and structure for this grant proposal, including all standard sections: needs statement, goals & objectives, methodology, evaluation plan, budget narrative, and sustainability plan.",
  },
  needs: {
    label: "Needs Statement",
    endpoint: "/api/writer/section",
    prompt:
      "Write the Needs Statement / Statement of Need section for this grant proposal, grounded in the organization's mission and focus areas.",
  },
  goals: {
    label: "Goals & Objectives",
    endpoint: "/api/writer/section",
    prompt:
      "Write the Goals & Objectives section for this grant proposal, with specific, measurable objectives.",
  },
  methodology: {
    label: "Methodology",
    endpoint: "/api/writer/section",
    prompt:
      "Write the Methodology / Project Design section for this grant proposal, describing the implementation strategy.",
  },
  evaluation: {
    label: "Evaluation Plan",
    endpoint: "/api/writer/section",
    prompt:
      "Write the Evaluation Plan section for this grant proposal, describing how outcomes will be measured.",
  },
  budget: {
    label: "Budget Narrative",
    endpoint: "/api/writer/budget-justification",
    prompt:
      "Write a budget narrative and justification for this project, aligned with the proposal's goals.",
  },
};

export default function SectionGeneratorPanel({
  workspaceId,
  documentId,
}: {
  workspaceId: string;
  documentId: string;
  userId?: string;
  content?: string;
  setContent?: (content: string) => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [messages, setMessages] = useState<
    { label: string; text: string; saved: boolean }[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  async function runWriter(label: string, endpoint: string, prompt: string) {
    setLoading(label);
    setError(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, documentId, prompt }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      const output: string = data.output || "";

      setMessages((prev) => [...prev, { label, text: output, saved: false }]);
    } catch (err: any) {
      console.error("Writer generation failed:", err);
      setError(err?.message || "Generation failed");
    } finally {
      setLoading(null);
    }
  }

  function generate(type: Exclude<SectionType, "custom">) {
    const cfg = SECTION_CONFIG[type];
    return runWriter(cfg.label, cfg.endpoint, cfg.prompt);
  }

  async function generateCustom() {
    if (!customPrompt.trim()) return;
    await runWriter("Custom Section", "/api/writer/section", customPrompt);
    setCustomPrompt("");
  }

  async function appendToDocument(index: number) {
    const message = messages[index];
    if (!message) return;

    try {
      const getRes = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}`
      );
      const existing = await getRes.json().catch(() => ({}));
      const currentContent: string =
        typeof existing?.content === "string" ? existing.content : "";

      const updatedContent = `${currentContent}${
        currentContent ? "\n\n" : ""
      }## ${message.label}\n\n${message.text}`;

      const patchRes = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: updatedContent }),
        }
      );

      if (!patchRes.ok) {
        const data = await patchRes.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save to document");
      }

      setMessages((prev) =>
        prev.map((m, i) => (i === index ? { ...m, saved: true } : m))
      );
    } catch (err: any) {
      console.error("Failed to save section to document:", err);
      setError(err?.message || "Failed to save to document");
    }
  }

  const buttons: Exclude<SectionType, "custom">[] = [
    "outline",
    "needs",
    "goals",
    "methodology",
    "evaluation",
    "budget",
  ];

  return (
    <div className="flex-1 h-full bg-slate-950 text-white p-8 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">AI Proposal Writer</h2>
          <p className="mt-2 text-slate-400">
            Generate real grant proposal sections with AI, then save them into
            this document.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {buttons.map((type) => {
            const cfg = SECTION_CONFIG[type];
            const isLoading = loading === cfg.label;
            return (
              <button
                key={type}
                onClick={() => generate(type)}
                disabled={loading !== null}
                className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-5 text-left hover:border-cyan-500 hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                <div className="font-semibold text-cyan-400">
                  {isLoading ? "Generating..." : cfg.label}
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  {cfg.prompt}
                </div>
              </button>
            );
          })}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">
            Custom Section Generator
          </h3>

          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
            placeholder="Describe a section you want AI to generate..."
          />

          <button
            onClick={generateCustom}
            disabled={loading !== null || !customPrompt.trim()}
            className="mt-4 px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-semibold hover:bg-cyan-400 transition disabled:opacity-50"
          >
            {loading === "Custom Section" ? "Generating..." : "Generate Custom Section"}
          </button>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-300 rounded-2xl p-4 mb-6">
            {error}
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-cyan-400">{m.label}</div>
                  <button
                    onClick={() => appendToDocument(i)}
                    disabled={m.saved}
                    className="text-sm px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {m.saved ? "Saved to document" : "Save to document"}
                  </button>
                </div>
                <div className="whitespace-pre-wrap text-slate-200">
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

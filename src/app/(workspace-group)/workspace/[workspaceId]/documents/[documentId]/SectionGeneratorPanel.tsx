"use client";

import { useState } from "react";

export default function SectionGeneratorPanel({
  workspaceId,
  documentId,
  userId,
  content,
  setContent,
}) {
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  function buildSections(type: string) {
    return [
      {
        type,
        content:
          typeof content === "string"
            ? content
            : JSON.stringify(content || {}),
      },
    ];
  }

  function extractGeneratedContent(
    batchSections: any
  ) {
    try {
      const parsed =
        typeof batchSections === "string"
          ? JSON.parse(batchSections)
          : batchSections;

      if (
        parsed?.processedSections &&
        Array.isArray(parsed.processedSections)
      ) {
        return parsed.processedSections
          .map(
            (section: any) =>
              `# ${section.type}\n\n${section.content}`
          )
          .join("\n\n");
      }

      return typeof batchSections === "string"
        ? batchSections
        : JSON.stringify(
            batchSections,
            null,
            2
          );
    } catch {
      return typeof batchSections === "string"
        ? batchSections
        : JSON.stringify(
            batchSections,
            null,
            2
          );
    }
  }

  async function generate(type: string) {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/batch-sections`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sections: buildSections(type),
          }),
        }
      );

      const text = await res.text();

      console.log(
        "SECTION STATUS:",
        res.status
      );
      console.log(
        "SECTION RESPONSE:",
        text
      );

      const data = text
        ? JSON.parse(text)
        : {};

      console.log(
        "BATCH SECTIONS DATA",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      if (data.batchSections) {
        const generatedContent =
          extractGeneratedContent(
            data.batchSections
          );

        setContent(generatedContent);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: generatedContent,
          },
        ]);
      }
    } catch (err) {
      console.error(
        "Section generation failed:",
        err
      );
    } finally {
      setLoading(false);
    }
  }

  async function generateCustom() {
    if (!customPrompt.trim()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/ai/batch-sections`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sections: [
              {
                type: "custom",
                prompt: customPrompt,
                content:
                  typeof content ===
                  "string"
                    ? content
                    : JSON.stringify(
                        content || {}
                      ),
              },
            ],
          }),
        }
      );

      const text = await res.text();

      console.log(
        "CUSTOM SECTION STATUS:",
        res.status
      );

      console.log(
        "CUSTOM SECTION RESPONSE:",
        text
      );

      const data = text
        ? JSON.parse(text)
        : {};

      console.log(
        "CUSTOM BATCH SECTIONS DATA",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      if (data.batchSections) {
        const generatedContent =
          extractGeneratedContent(
            data.batchSections
          );

        setContent(generatedContent);

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: generatedContent,
          },
        ]);
      }
    } catch (err) {
      console.error(
        "Custom section generation failed:",
        err
      );
    } finally {
      setLoading(false);
      setCustomPrompt("");
    }
  }

  return (
  <div className="flex-1 h-full bg-slate-950 text-white p-8 overflow-y-auto">
    <div className="max-w-5xl mx-auto">

      <div className="mb-8">
        <h2 className="text-3xl font-bold">
          AI Section Generator
        </h2>

        <p className="mt-2 text-slate-400">
          Generate complete grant sections using AI-powered proposal writing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">

        <button
  onClick={() => generate("outline")}
  className="cursor-pointer bg-slate-900 border border-slate-700 rounded-2xl p-5 hover:border-cyan-500 hover:bg-slate-800 transition-all"
>
          <div className="font-semibold text-cyan-400">
            Generate Outline
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Build a complete proposal structure.
          </div>
        </button>

        <button
          onClick={() => generate("needs")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-cyan-500 transition"
        >
          <div className="font-semibold text-cyan-400">
            Needs Statement
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Generate community need and problem statements.
          </div>
        </button>

        <button
          onClick={() => generate("goals")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-cyan-500 transition"
        >
          <div className="font-semibold text-cyan-400">
            Goals & Objectives
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Create measurable project objectives.
          </div>
        </button>

        <button
          onClick={() => generate("methodology")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-cyan-500 transition"
        >
          <div className="font-semibold text-cyan-400">
            Methodology
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Build project implementation strategies.
          </div>
        </button>

        <button
          onClick={() => generate("evaluation")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-cyan-500 transition"
        >
          <div className="font-semibold text-cyan-400">
            Evaluation Plan
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Measure project outcomes and success.
          </div>
        </button>

        <button
          onClick={() => generate("budget")}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-left hover:border-cyan-500 transition"
        >
          <div className="font-semibold text-cyan-400">
            Budget Narrative
          </div>

          <div className="mt-2 text-sm text-slate-400">
            Generate budget justification content.
          </div>
        </button>

      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">

        <h3 className="text-xl font-semibold mb-4">
          Custom Section Generator
        </h3>

        <textarea
          value={customPrompt}
          onChange={(e) =>
            setCustomPrompt(e.target.value)
          }
          className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white"
          placeholder="Describe a section you want AI to generate..."
        />

        <button
          onClick={generateCustom}
          className="mt-4 px-6 py-3 bg-cyan-500 text-slate-950 rounded-xl font-semibold hover:bg-cyan-400 transition"
        >
          Generate Custom Section
        </button>

      </div>

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          AI generating proposal content...
        </div>
      )}

      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 whitespace-pre-wrap"
            >
              {m.text}
            </div>
          ))}
        </div>
      )}

    </div>
  </div>
);
}
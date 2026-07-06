"use client";

import { useState } from "react";
import { NarrativeEditor } from "@/components/narratives/NarrativeEditor";

export default function NarrativePage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);

    const project = {
      title: "Community Youth STEM Program",
      goals: "Expand STEM access for underserved youth",
      location: "Alabama",
      population: "students ages 10–17",
      needs: "equipment, curriculum, instructor training",
    };

    const res = await fetch("/api/ai/narrative", {
      method: "POST",
      body: JSON.stringify({
        section: "Project Overview",
        project,
        tone: "formal",
      }),
    });

    const data = await res.json();
    setText(data.text);

    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        AI Narrative Generator
      </h1>

      <button
        onClick={generate}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-4 py-2 text-sm font-medium"
      >
        Generate Narrative
      </button>

      {loading && <div className="text-slate-400">Generating...</div>}

      <NarrativeEditor text={text} onChange={setText} />
    </div>
  );
}

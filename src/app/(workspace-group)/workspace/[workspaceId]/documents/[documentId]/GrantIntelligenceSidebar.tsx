"use client";

import { useState } from "react";

export default function GrantIntelligenceSidebar({
  onSelectPanel,
  activePanel
}) {
  const panels = [
    { id: "risk", label: "Risk Assessment" },
    { id: "budget", label: "Budget Risk" },
    { id: "readability", label: "Readability Optimizer" },
    { id: "compliance", label: "Compliance Checker" },
    { id: "evidence", label: "Evidence Strength" },
    { id: "heatmap", label: "Risk Heatmap" },
    { id: "coherence", label: "Narrative Coherence" },
    { id: "impact", label: "Multi‑Year Impact" },
    { id: "review", label: "Grant Reviewer" },
    { id: "funders", label: "Funder Match" },
    { id: "inline", label: "Inline Suggestions" }
  ];

  return (
    <div className="w-64 h-full bg-gray-900 text-white flex flex-col border-r border-gray-700">
      <div className="p-4 text-xl font-bold tracking-wide border-b border-gray-700">
        Intelligence Suite
      </div>

      <div className="flex-1 overflow-y-auto">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => onSelectPanel(panel.id)}
            className={`w-full text-left px-4 py-3 hover:bg-gray-800 transition ${
              activePanel === panel.id ? "bg-gray-800 font-semibold" : ""
            }`}
          >
            {panel.label}
          </button>
        ))}
      </div>
    </div>
  );
}

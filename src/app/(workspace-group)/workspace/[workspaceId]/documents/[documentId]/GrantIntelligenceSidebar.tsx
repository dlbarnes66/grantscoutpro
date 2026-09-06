"use client";

export default function GrantIntelligenceSidebar({
  onSelectPanel,
  activePanel,
}: {
  onSelectPanel: (panel: string) => void;
  activePanel: string;
}) {
  const panels = [
    { id: "risk", label: "🛡 Risk Assessment" },
    { id: "budget", label: "💰 Budget Risk" },
    { id: "readability", label: "📖 Readability" },
    { id: "compliance", label: "✅ Compliance" },
    { id: "evidence", label: "📈 Evidence Strength" },
    { id: "heatmap", label: "🔥 Risk Heatmap" },
    { id: "coherence", label: "🧩 Coherence" },
    { id: "impact", label: "🎯 Impact Analysis" },
    { id: "review", label: "📝 Grant Review" },
    { id: "funders", label: "🤝 Funder Match" },
    { id: "application", label: "🚀 Application Builder" },
    { id: "inline", label: "💡 Suggestions" },
  ];

  return (
    <aside
      style={{ width: "260px", minWidth: "260px" }}
      className="h-full bg-slate-950 border-r border-slate-800 flex flex-col"
    >
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">
          Intelligence Suite
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          AI-powered grant analysis
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {panels.map((panel) => (
          <div
            key={panel.id}
            className="mb-5 px-2"
          >
            <div
              onClick={() => onSelectPanel(panel.id)}
              className={`cursor-pointer rounded-xl px-4 py-4 text-left transition-all ${
                activePanel === panel.id
                  ? "bg-cyan-600 text-white"
                  : "bg-slate-800 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {panel.label}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
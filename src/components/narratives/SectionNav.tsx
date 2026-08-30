"use client";

export default function SectionNav({ onSelectAction }) {
  return (
    <nav className="flex gap-2">
      <button
        className="px-3 py-2 bg-gray-200 rounded"
        onClick={() => onSelectAction("overview")}
      >
        Overview
      </button>

      <button
        className="px-3 py-2 bg-gray-200 rounded"
        onClick={() => onSelectAction("history")}
      >
        History
      </button>
    </nav>
  );
}

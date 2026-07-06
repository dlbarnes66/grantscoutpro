"use client";

import { useState } from "react";

export default function SubmissionChecklist({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [items, setItems] = useState([
    { label: "All sections drafted", done: false },
    { label: "Narrative reviewed", done: false },
    { label: "Budget completed", done: false },
    { label: "Attachments prepared", done: false },
    { label: "Submission portal account created", done: false },
    { label: "Deadline confirmed", done: false }
  ]);

  const [exporting, setExporting] = useState(false);

  function toggleItem(index: number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  }

  async function exportPDF() {
    setExporting(true);

    const res = await fetch("/api/grants/export/pdf", {
      method: "POST",
      body: JSON.stringify({ grantId }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grant-${grantId}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);

    setExporting(false);
  }

  const allDone = items.every((i) => i.done);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {items.map((item, i) => (
          <label key={i} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleItem(i)}
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      <button
        onClick={exportPDF}
        disabled={exporting || !allDone}
        className={`px-4 py-2 rounded-md text-white ${
          allDone ? "bg-green-600" : "bg-gray-400"
        }`}
      >
        {exporting ? "Exporting PDF..." : "Export Submission PDF"}
      </button>

      {!allDone && (
        <p className="text-sm text-gray-600">
          Complete all checklist items before exporting the final PDF.
        </p>
      )}
    </div>
  );
}

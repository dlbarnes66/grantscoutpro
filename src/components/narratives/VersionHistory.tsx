"use client";

export default function VersionHistory({ versions, onSelectAction }) {
  return (
    <div className="space-y-2">
      {versions.map((v) => (
        <button
          key={v.id}
          className="block w-full text-left p-2 bg-gray-100 rounded"
          onClick={() => onSelectAction(v.id)}
        >
          Version {v.id} — {v.date}
        </button>
      ))}
    </div>
  );
}

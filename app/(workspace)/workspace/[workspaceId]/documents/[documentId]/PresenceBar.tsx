"use client";

export default function PresenceBar({ presence }) {
  if (!presence || presence.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No one else is viewing this document.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {presence.map((p) => (
        <div
          key={p.userId}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-md"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-sm text-gray-700">
            User {p.userId} active
          </span>
        </div>
      ))}
    </div>
  );
}

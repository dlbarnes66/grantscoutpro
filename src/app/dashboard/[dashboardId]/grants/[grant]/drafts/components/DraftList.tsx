"use client";

export function DraftList({
  drafts,
  onSelect,
}: {
  drafts: any[];
  onSelect: (draft: any) => void;
}) {
  if (drafts.length === 0) {
    return <p className="text-gray-500">No drafts yet.</p>;
  }

  return (
    <div className="space-y-2">
      {drafts.map((draft) => (
        <button
          key={draft.id}
          onClick={() => onSelect(draft)}
          className="w-full text-left border rounded px-3 py-2 hover:bg-gray-50"
        >
          <div className="font-semibold">
            {draft.title || "Untitled Draft"}
          </div>
          {draft.updatedAt && (
            <div className="text-xs text-gray-500">
              Updated: {new Date(draft.updatedAt).toLocaleString()}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

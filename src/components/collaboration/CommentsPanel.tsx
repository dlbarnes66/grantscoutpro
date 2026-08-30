"use client";

import Button from "@/components/ui/Button";

export default function CommentsPanel({ comments, onToggle }) {
  return (
    <div className="p-4 bg-white border rounded-xl space-y-3">
      <h3 className="text-lg font-semibold">Comments</h3>

      <Button
        variant="ghost"
        onClickAction={onToggle}
        icon={undefined}
        className=""
      >
        Toggle Comments
      </Button>

      <div className="space-y-2">
        {comments.map((c) => (
          <div key={c.id} className="p-2 border rounded bg-gray-50">
            <p className="text-sm">{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

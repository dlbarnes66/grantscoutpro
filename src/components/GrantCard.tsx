"use client";

import Button from "@/components/ui/Button";

export default function GrantCard({ grant, onOpen }) {
  return (
    <div className="p-4 border rounded-xl bg-white space-y-3">
      <h3 className="text-lg font-semibold">{grant.title}</h3>
      <p className="text-sm text-gray-700">{grant.summary}</p>

      <Button
        variant="ghost"
        onClickAction={onOpen}
        icon={undefined}
        className=""
      >
        View Grant
      </Button>
    </div>
  );
}

"use client";

import React from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export function GrantMatchingResults({
  results = [],
  onSelectAction,
}: {
  results?: Array<{ id: string; title: string; score: number }>;
  onSelectAction?: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      {results.map((r) => (
        <Card key={r.id} className="p-4 flex items-center justify-between">
          <div>
            <div className="font-semibold">{r.title}</div>
            <div className="text-sm text-gray-600">Match Score: {r.score}</div>
          </div>

          <Button
            variant="secondary"
            onClickAction={() => onSelectAction?.(r.id)}
            icon={undefined}
            className=""
          >
            Select
          </Button>
        </Card>
      ))}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

export function GrantMatchingForm({
  onMatchAction,
}: {
  onMatchAction?: (criteria: any) => void;
}) {
  const [keywords, setKeywords] = useState("");

  const submit = () => {
    onMatchAction?.({ keywords });
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full p-2 border rounded"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
        placeholder="Enter keywords…"
      />

      <Button
        variant="primary"
        onClickAction={submit}
        icon={undefined}
        className=""
      >
        Find Matching Grants
      </Button>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

export function SearchBar({
  onSearchAction,
}: {
  onSearchAction?: (query: string) => void;
}) {
  const [query, setQuery] = useState("");

  const submit = () => {
    onSearchAction?.(query);
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 p-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search workspace…"
      />

      <Button
        variant="primary"
        onClickAction={submit}
        icon={undefined}
        className=""
      >
        Search
      </Button>
    </div>
  );
}

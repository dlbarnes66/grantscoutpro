"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

export function AIDraftingPanel({
  onGenerateAction,
}: {
  onGenerateAction?: (draft: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    const mockDraft =
      "This is an AI‑generated draft placeholder for demonstration.";

    await new Promise((r) => setTimeout(r, 800));

    onGenerateAction?.(mockDraft);

    setLoading(false);
  };

  return (
    <Button
      variant="primary"
      disabled={loading}
      onClickAction={generate}
      icon={undefined}
      className=""
    >
      {loading ? "Generating…" : "Generate Draft"}
    </Button>
  );
}

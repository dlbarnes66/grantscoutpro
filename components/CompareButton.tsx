"use client";

import { useState } from "react";
import Button from "@/components/ui/Button"; // ⭐ FIXED

interface CompareButtonProps {
  comparing: boolean;
  onClick: () => void;
}

export default function CompareButton({ comparing, onClick }: CompareButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setLoading(false);
  };

  return (
    <Button
      variant={comparing ? "primary" : "secondary"}
      className="px-3 py-1 text-sm"
      onClick={handleClick}
      disabled={loading}
    >
      {loading
        ? "Loading…"
        : comparing
        ? "Comparing…"
        : "Compare"}
    </Button>
  );
}

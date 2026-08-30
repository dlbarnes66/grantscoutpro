"use client";

import Button from "@/components/ui/Button";

export default function CompareButton({ onCompare, loading }) {
  return (
    <Button
      variant="outline"
      disabled={loading}
      onClickAction={onCompare}
      icon={undefined}
      className=""
    >
      Compare
    </Button>
  );
}

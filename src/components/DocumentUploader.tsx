"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";

export default function DocumentUploader({
  onUploadAction,
}: {
  onUploadAction?: (file: File) => void;
}) {
  const [file, setFile] = useState<File | null>(null);

  const upload = () => {
    if (!file) return;
    onUploadAction?.(file);
    setFile(null);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        className="w-full"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <Button
        variant="primary"
        disabled={!file}
        onClickAction={upload}
        icon={undefined}
        className=""
      >
        Upload Document
      </Button>
    </div>
  );
}

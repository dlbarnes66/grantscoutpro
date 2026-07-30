"use client";

import { useState } from "react";

export function DocumentUploader({ grantId }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload() {
    if (!file) return;

    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    await fetch(`/api/grant-documents/${grantId}/upload`, {
      method: "POST",
      body: form,
    });

    setUploading(false);
    setFile(null);
    alert("Uploaded!");
    location.reload();
  }

  return (
    <div className="border rounded p-4 space-y-4">
      <h3 className="font-semibold">Upload Document</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full"
      />

      <button
        onClick={upload}
        disabled={uploading}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";

export function useUploadDocument() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedId, setUploadedId] = useState<string | null>(null);

  async function upload(file: File) {
    try {
      setLoading(true);
      setError(null);
      setUploadedId(null);

      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setLoading(false);
        return;
      }

      setUploadedId(data.documentId);
      setLoading(false);
    } catch (err) {
      console.error("Upload error:", err);
      setError("Unexpected upload error");
      setLoading(false);
    }
  }

  return { upload, loading, error, uploadedId };
}

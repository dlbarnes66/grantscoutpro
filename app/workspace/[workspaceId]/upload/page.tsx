"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function UploadPage({ params }: { params: { workspaceId: string } }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleUpload = async () => {
    if (!file) return;

    setStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/workspaces/${params.workspaceId}/upload`, {
      method: "POST",
      body: formData,
    });

    const json = await res.json();

    if (!res.ok) {
      setStatus(`Error: ${json.error}`);
      return;
    }

    setStatus("File uploaded and embedded successfully.");
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Upload File</h1>

      <Card className="p-4 space-y-4">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <Button onClick={handleUpload}>Upload</Button>

        {status && <p className="text-gray-700">{status}</p>}
      </Card>
    </div>
  );
}

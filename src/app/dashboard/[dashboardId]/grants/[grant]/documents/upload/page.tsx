"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadDocumentPage({ params }: any) {
  const { workspaceId, grantId } = params;
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);

  async function upload() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/grant/${grantId}/documents`, {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      router.push(`/dashboard/${workspaceId}/grant/${grantId}/documents`);
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-slate-100">Upload Document</h1>

      <input
        type="file"
        className="text-slate-300"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />

      <button
        onClick={upload}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        Upload
      </button>
    </div>
  );
}

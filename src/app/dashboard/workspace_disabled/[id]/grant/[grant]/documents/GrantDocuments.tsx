"use client";

import { useEffect, useState } from "react";

export default function GrantDocuments({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [tag, setTag] = useState("General");

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/grants/${grantId}/documents`);
      const json = await res.json();
      setDocuments(json.documents || []);
      setLoading(false);
    }
    load();
  }, [grantId]);

  async function upload() {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("grantId", grantId);
    formData.append("tag", tag);
    formData.append("file", file);

    const res = await fetch("/api/grants/documents/upload", {
      method: "POST",
      body: formData
    });

    const json = await res.json();
    if (json.document) {
      setDocuments((prev) => [json.document, ...prev]);
    }

    setUploading(false);
    setFile(null);
  }

  if (loading) {
    return <p>Loading documents...</p>;
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <h2 className="text-xl font-semibold">Upload Document</h2>

      <div className="space-y-3">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full"
        />

        <select
          className="p-2 border rounded-md"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option>General</option>
          <option>Requirements</option>
          <option>Narrative</option>
          <option>Budget</option>
          <option>Attachments</option>
        </select>

        <button
          onClick={upload}
          disabled={uploading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6">Documents</h2>

      <div className="space-y-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-4 border rounded-md bg-gray-50 space-y-3"
          >
            <h3 className="font-semibold">{doc.name}</h3>
            <p className="text-sm text-gray-600">Tag: {doc.tag}</p>

            <p className="text-gray-700 whitespace-pre-wrap">
              {doc.summary}
            </p>

            <ul className="list-disc ml-6 text-gray-700">
              {doc.keyPoints.map((kp: string, i: number) => (
                <li key={i}>{kp}</li>
              ))}
            </ul>

            <a
              href={`data:${doc.mimeType};base64,${doc.contentBase64}`}
              download={doc.name}
              className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

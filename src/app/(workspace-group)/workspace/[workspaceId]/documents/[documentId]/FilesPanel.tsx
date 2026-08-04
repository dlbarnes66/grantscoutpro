"use client";

import { useEffect, useState } from "react";

export default function FilesPanel({ workspaceId, documentId, userId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  async function fetchFiles() {
    try {
      const res = await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/files`
      );
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/files/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      fetchFiles();
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setUploading(false);
    }
  }

  async function deleteFile(fileId) {
    try {
      await fetch(
        `/api/workspace/${workspaceId}/documents/${documentId}/files/${fileId}`,
        {
          method: "DELETE"
        }
      );

      fetchFiles();
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  }

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="w-96 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Files</h2>

      <label className="block mb-4">
        <div className="px-4 py-2 bg-blue-600 text-white rounded-md text-center cursor-pointer hover:bg-blue-700">
          {uploading ? "Uploading..." : "Upload File"}
        </div>
        <input
          type="file"
          className="hidden"
          onChange={uploadFile}
        />
      </label>

      {loading ? (
        <div className="text-gray-500">Loading files...</div>
      ) : files.length === 0 ? (
        <div className="text-gray-500">No files uploaded.</div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          {files.map((f) => (
            <div
              key={f.id}
              className="border rounded-md p-3 bg-gray-50 space-y-2"
            >
              <div className="text-sm font-medium">{f.filename}</div>

              <div className="text-xs text-gray-500">
                {new Date(f.createdAt).toLocaleString()}
              </div>

              <div className="flex gap-2">
                <a
                  href={`/api/workspace/${workspaceId}/documents/${documentId}/files/${f.id}`}
                  target="_blank"
                  className="px-3 py-1 bg-gray-300 rounded-md text-sm hover:bg-gray-400"
                >
                  Download
                </a>

                <button
                  onClick={() => deleteFile(f.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useUploadDocument } from "@/hooks/useUploadDocument";
import { Upload, Loader2, FileText } from "lucide-react";

interface UploadResult {
  upload: (file: File) => Promise<void>;
  loading: boolean;
  error: string | null;
  uploadedId: string | null;
}

export default function DocumentUploader() {
  const { upload, loading, error, uploadedId } =
    useUploadDocument() as UploadResult;

  const [dragging, setDragging] = useState<boolean>(false);

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) upload(file);
  }

  return (
    <div className="p-6 bg-white border rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Upload Document
      </h2>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition ${
          dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />

        <p className="text-gray-600 mb-3">
          Drag & drop a PDF or DOCX file here
        </p>

        <label className="cursor-pointer text-blue-600 hover:underline">
          Select a file
          <input
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={handleFileSelect}
          />
        </label>
      </div>

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Uploading and processing document…</span>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 text-sm">
          {error}
        </div>
      )}

      {uploadedId && (
        <div className="mt-4 flex items-center gap-2 text-green-700">
          <FileText className="w-5 h-5" />
          <span>Document uploaded successfully!</span>
        </div>
      )}
    </div>
  );
}

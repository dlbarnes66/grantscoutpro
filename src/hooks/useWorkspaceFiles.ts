"use client";

import { useCallback, useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import { WorkspaceFile } from "@/types/workspace";

interface UseWorkspaceFilesResult {
  files: WorkspaceFile[];
  loading: boolean;
  uploading: boolean;
  uploadProgress: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  uploadFile: (file: File) => Promise<boolean>;
  removeFile: (fileId: string) => Promise<boolean>;
}

export function useWorkspaceFiles(workspaceId: string): UseWorkspaceFilesResult {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/files`);
      if (!res.ok) {
        setFiles([]);
        return;
      }
      const data = await res.json();
      setFiles(Array.isArray(data.files) ? data.files : []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (workspaceId) fetchFiles();
  }, [workspaceId, fetchFiles]);

  // Uploads straight from the browser to Blob storage (the file's bytes
  // never pass through our own server), then records the result as a
  // WorkspaceFile row so it shows up in the list.
  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setUploadProgress(`Uploading ${file.name}...`);
      setError(null);
      try {
        const blob = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: `/api/workspaces/${workspaceId}/files/upload-token`,
        });

        const res = await fetch(`/api/workspaces/${workspaceId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || blob.contentType,
            size: file.size,
            url: blob.url,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Upload succeeded but saving the file record failed.");
          return false;
        }

        await fetchFiles();
        return true;
      } catch (err: any) {
        setError(err?.message || "Failed to upload file.");
        return false;
      } finally {
        setUploading(false);
        setUploadProgress(null);
      }
    },
    [workspaceId, fetchFiles]
  );

  const removeFile = useCallback(
    async (fileId: string) => {
      setError(null);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/files/${fileId}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Failed to delete file.");
          return false;
        }
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        return true;
      } catch {
        setError("Failed to delete file.");
        return false;
      }
    },
    [workspaceId]
  );

  return {
    files,
    loading,
    uploading,
    uploadProgress,
    error,
    refresh: fetchFiles,
    uploadFile,
    removeFile,
  };
}

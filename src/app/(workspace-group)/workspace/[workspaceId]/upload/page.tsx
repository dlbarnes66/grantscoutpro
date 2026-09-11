"use client";

import { useParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { FileText, Upload, Loader2, Trash2, Download } from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { useWorkspaceFiles } from "@/hooks/useWorkspaceFiles";
import type { WorkspaceFile } from "@/types/workspace";

function formatBytes(bytes: number) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function FileRow({ file, onDelete }: { file: WorkspaceFile; onDelete: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(file.id);
    setDeleting(false);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-[#0A1A2F] text-[#00E5FF]">
          <FileText size={16} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-white">{file.filename}</p>
          <p className="mt-0.5 text-[12px] text-slate-500">
            {formatBytes(file.size)} &middot; Uploaded {formatDate(file.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <a
          href={file.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download file"
          title="Download"
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <Download size={14} />
        </a>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Delete file"
          title="Delete"
          className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        >
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function WorkspaceUploadPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const { files, loading, uploading, uploadProgress, error, uploadFile, removeFile } =
    useWorkspaceFiles(workspaceId);

  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;
      for (const file of Array.from(fileList)) {
        await uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <WorkspaceShell title="Upload Documents" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Upload" },
        ]}
      />

      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-semibold text-white">Upload Documents</h1>
        <p className="mt-1 text-[13px] text-slate-400">
          Upload grant applications, budgets, and supporting documents for this workspace.
        </p>
      </div>

      <Card className="p-6">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
            dragActive
              ? "border-[#00E5FF]/60 bg-[#00E5FF]/[0.06]"
              : "border-white/[0.12] bg-white/[0.02] hover:border-white/[0.2]"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/[0.1] bg-[#0A1A2F] text-[#00E5FF]">
            <Upload size={20} />
          </div>
          <div>
            <p className="text-[14px] font-medium text-white">
              Drag and drop files here, or click to browse
            </p>
            <p className="mt-1 text-[12px] text-slate-500">
              PDF, Word, Excel, CSV, text, or image files up to 25MB
            </p>
          </div>
        </div>

        {uploading && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-slate-300">
            <Loader2 size={14} className="animate-spin text-[#00E5FF]" />
            {uploadProgress || "Uploading..."}
          </div>
        )}

        {error && <p className="mt-4 text-[13px] text-red-400">{error}</p>}
      </Card>

      <div className="mt-6">
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Files ({files.length})
        </p>

        {loading && <div className="text-slate-400">Loading files…</div>}

        {!loading && files.length === 0 && (
          <p className="text-[13px] text-slate-500">No documents uploaded yet.</p>
        )}

        {!loading && files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <FileRow key={file.id} file={file} onDelete={removeFile} />
            ))}
          </div>
        )}
      </div>
    </WorkspaceShell>
  );
}

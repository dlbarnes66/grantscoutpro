"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function NewDocumentPage() {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const params = useParams();
  const router = useRouter();

  const workspaceId = params.workspaceId as string;

  async function createDocument() {
    if (!title.trim()) {
      alert("Please enter a document title.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create document");
      }

      if (!data?.document?.id) {
        throw new Error("Document ID not returned from API");
      }

      router.push(
        `/workspace/${workspaceId}/documents/${data.document.id}`
      );
    } catch (error: any) {
      console.error("Create document failed:", error);

      alert(
        error?.message ||
          "Failed to create document."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <WorkspaceShell title="Create Document" workspaceId={workspaceId}>
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">
          Create Document
        </h1>

        <div className="space-y-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full border rounded-md px-4 py-3 text-slate-900"
          />

          <button
            onClick={createDocument}
            disabled={loading}
            className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Creating Document..."
              : "Create Document"}
          </button>
        </div>
      </div>
    </WorkspaceShell>
  );
}

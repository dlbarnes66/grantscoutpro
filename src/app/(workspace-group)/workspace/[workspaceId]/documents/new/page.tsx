"use client"
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewDocumentPage({ params }) {
  const { workspaceId } = params;
  const [title, setTitle] = useState("");
  const router = useRouter();

  async function createDocument() {
    const res = await fetch(`/api/workspace/${workspaceId}/documents/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    const data = await res.json();
    router.push(`/workspace/${workspaceId}/documents/${data.documentId}/view`);
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Document</h1>

      <input
        type="text"
        placeholder="Document title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={createDocument}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Create Document
      </button>
    </div>
  );
}

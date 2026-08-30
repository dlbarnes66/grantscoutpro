"use client"
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkspacePage() {
  const [name, setName] = useState("");
  const router = useRouter();

  async function createWorkspace() {
    const res = await fetch("/api/workspace/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    const data = await res.json();
    router.push(`/workspace/${data.workspaceId}`);
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Workspace</h1>

      <input
        type="text"
        placeholder="Workspace name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <button
        onClick={createWorkspace}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Create Workspace
      </button>
    </div>
  );
}

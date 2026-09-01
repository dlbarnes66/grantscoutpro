"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewWorkspacePage() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const router = useRouter();

  async function createWorkspace() {
    try {
      setCreating(true);
      setError("");

      const res = await fetch("/api/workspace/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
        }),
      });

      const text = await res.text();

      console.log("WORKSPACE STATUS:", res.status);
      console.log("WORKSPACE RAW RESPONSE:", text);

      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("API returned invalid JSON");
        }
      }

      if (!res.ok) {
        throw new Error(
          data?.error || `Workspace creation failed (${res.status})`
        );
      }

      if (!data.workspaceId) {
        throw new Error("Workspace ID missing from API response");
      }

      router.push(`/workspace/${data.workspaceId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Create Workspace
      </h1>

      <input
        type="text"
        placeholder="Workspace name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      {error && (
        <div className="mb-4 text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={createWorkspace}
        disabled={creating}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {creating ? "Creating..." : "Create Workspace"}
      </button>
    </div>
  );
}
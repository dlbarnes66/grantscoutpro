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

      const res = await fetch(
        "/api/workspaces/create",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            name,
          }),
        }
      );

      const text = await res.text();

      let data: any = {};

      if (text) {
        data = JSON.parse(text);
      }

      if (!res.ok) {
        throw new Error(
          data?.error ??
            "Workspace creation failed"
        );
      }

      const workspaceId =
        data?.workspaceId ||
        data?.workspace?.id;

      if (!workspaceId) {
        throw new Error(
          "Workspace ID missing"
        );
      }

      router.push(
        `/workspace/${workspaceId}`
      );
    } catch (err: any) {
      setError(
        err?.message ||
          "Unknown error"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl p-10">

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-white">
            Create Workspace
          </h1>

          <p className="mt-3 text-slate-400">
            Create a workspace for grant
            research, writing, AI analysis,
            collaboration, and document
            management.
          </p>
        </div>

        <div className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Workspace Name
            </label>

            <input
              type="text"
              placeholder="Grant Writing Team"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={createWorkspace}
            disabled={
              creating || !name.trim()
            }
            className="w-full rounded-xl bg-cyan-500 py-4 text-lg font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {creating
              ? "Creating Workspace..."
              : "Create Workspace"}
          </button>

        </div>
      </div>
    </div>
  );
}
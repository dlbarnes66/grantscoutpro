"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

export default function WorkspacePickerPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/workspaces");
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load workspaces");
        }

        if (!cancelled) setWorkspaces(json.workspaces || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load workspaces");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1A2F] text-white p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Your Workspaces</h1>
          <Link
            href="/workspace/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            New Workspace
          </Link>
        </div>

        {loading && <p className="text-slate-400">Loading your workspaces...</p>}

        {error && (
          <p className="text-red-400">Couldn&apos;t load workspaces: {error}</p>
        )}

        {!loading && !error && workspaces.length === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
            <p className="text-slate-300 text-lg font-medium">
              You don&apos;t have a workspace yet
            </p>
            <Link
              href="/workspace/new"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Create your first workspace
            </Link>
          </div>
        )}

        {!loading && !error && workspaces.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workspaces.map((ws) => (
              <Link
                key={ws.id}
                href={`/workspace/${ws.id}`}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-[#00E5FF] transition"
              >
                <p className="text-lg font-semibold">{ws.name}</p>
                <p className="text-sm text-slate-400 mt-2">
                  Created {new Date(ws.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Sparkles, Search, FileText, SendHorizonal, PlusCircle } from "lucide-react";

interface Workspace {
  id: string;
  name: string;
  createdAt: string;
}

const WORKFLOW_STEPS = [
  {
    icon: Search,
    title: "Find grants",
    body: "Search and filter opportunities matched to your organization's location and mission.",
  },
  {
    icon: Sparkles,
    title: "Compare & save",
    body: "Shortlist the best fits and compare requirements side by side.",
  },
  {
    icon: FileText,
    title: "Draft with AI",
    body: "Generate and refine proposal sections inside a workspace document.",
  },
  {
    icon: SendHorizonal,
    title: "Submit & track",
    body: "Track deadlines, submissions, and renewals from one place.",
  },
];

export default function DashboardHomePage() {
  const { user } = useUser();
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

        if (!cancelled) {
          setWorkspaces(json.workspaces || []);
        }
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

  const firstName = user?.firstName || "there";

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {firstName}</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          GrantScout Pro helps you find, track, and write winning grant
          proposals with AI. Everything for a given project lives inside a
          workspace.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Workspaces</h2>
          <Link
            href="/workspace/new"
            className="inline-flex items-center gap-2 text-sm text-[#00E5FF] hover:underline"
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
            <p className="text-slate-400 max-w-md mx-auto">
              Create one to start searching for grants, saving opportunities,
              and drafting proposals with AI.
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
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/compare"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-[#00E5FF] transition"
          >
            <p className="text-lg font-semibold">Compare Grants</p>
            <p className="text-sm text-slate-400 mt-2">
              Put shortlisted grants side by side to weigh fit and effort.
            </p>
          </Link>

          <Link
            href="/recommendations"
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-[#00E5FF] transition"
          >
            <p className="text-lg font-semibold">Recommendations</p>
            <p className="text-sm text-slate-400 mt-2">
              AI-suggested grants based on the documents you've uploaded.
            </p>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {WORKFLOW_STEPS.map((step, idx) => (
            <div
              key={step.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <step.icon className="w-5 h-5 text-[#00E5FF]" />
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  Step {idx + 1}
                </span>
              </div>
              <p className="font-semibold mb-1">{step.title}</p>
              <p className="text-sm text-slate-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SupportSettingsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const { user } = useUser();

  const [canSubmit, setCanSubmit] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [type, setType] = useState<"problem" | "suggestion">("problem");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workspaceId || !user) return;
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}`);
        const json = await res.json();
        if (!res.ok) throw new Error();
        const workspace = json.workspace;
        const isOwner = workspace.ownerId === user.id;
        const membership = workspace.members?.find((m: any) => m.userId === user.id);
        setCanSubmit(isOwner || membership?.role === "admin");
      } catch {
        setCanSubmit(false);
      } finally {
        setCheckingAccess(false);
      }
    })();
  }, [workspaceId, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject: subject.trim(), description: description.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to submit");
      setMessage("Thanks - your report has been sent to the Grant Scout Pro team.");
      setSubject("");
      setDescription("");
    } catch (err: any) {
      setError(err?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <WorkspaceShell title="Report a Problem or Suggestion" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Workspace Settings", href: `/workspace/${workspaceId}/settings` },
          { label: "Report a Problem or Suggestion" },
        ]}
      />

      <Card className="max-w-xl p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold">Report a Problem or Suggestion</h1>
          <p className="mt-1 text-sm text-slate-400">
            Found something broken, or have an idea to make Grant Scout Pro better? Let us know below. Only
            workspace owners and admins can submit a report.
          </p>
        </div>

        {message && <p className="text-[#00E5FF] text-sm">{message}</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {checkingAccess ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : !canSubmit ? (
          <p className="text-amber-400 text-sm">Only workspace owners or admins can submit a report.</p>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                checked={type === "problem"}
                onChange={() => setType("problem")}
              />
              Problem
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="type"
                checked={type === "suggestion"}
                onChange={() => setType("suggestion")}
              />
              Suggestion
            </label>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-slate-500">Subject</label>
            <input
              type="text"
              required
              maxLength={200}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Short summary"
              className="w-full p-3 rounded-lg text-black"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wide text-slate-500">Details</label>
            <textarea
              required
              maxLength={5000}
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened, or what would you like to see?"
              className="w-full p-3 rounded-lg text-black"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !subject.trim() || !description.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00E5FF] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#06131F] font-medium rounded-lg transition"
          >
            {submitting ? "Sending..." : "Send Report"}
          </button>
        </form>
        )}
      </Card>
    </WorkspaceShell>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import { Sparkles, Loader2, Download, CheckCircle2, Upload, FileText, RotateCcw } from "lucide-react";

interface ApplicationQuestion {
  id: string;
  prompt: string;
  wordLimit: number | null;
  answer: string;
}
interface Assistant {
  id: string;
  status: "draft" | "ready";
  sourceType: "pasted" | "uploaded";
  sourceFileName: string | null;
  questions: ApplicationQuestion[];
}

function wordCount(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export default function ApplicationAssistantPage() {
  const params = useParams() as { workspaceId: string; grantId: string };
  const { workspaceId, grantId } = params;

  const [loading, setLoading] = useState(true);
  const [eligible, setEligible] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [assistant, setAssistant] = useState<Assistant | null>(null);

  const [questionsText, setQuestionsText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [marking, setMarking] = useState(false);
  const [showRedraft, setShowRedraft] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/application-assistant`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setEligible(data.eligible);
      setReason(data.reason);
      setAssistant(data.assistant);
    } catch (err: any) {
      setError(err?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId && grantId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, grantId]);

  async function draftAnswers() {
    setDrafting(true);
    setError(null);
    setMessage(null);
    try {
      let res: Response;
      if (file) {
        const form = new FormData();
        form.append("file", file);
        res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/application-assistant`, {
          method: "POST",
          body: form,
        });
      } else {
        res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/application-assistant`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionsText }),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Couldn't draft answers");
      setAssistant(data.assistant);
      setQuestionsText("");
      setFile(null);
      setShowRedraft(false);
      setMessage(`Drafted answers to ${data.assistant.questions.length} question${data.assistant.questions.length === 1 ? "" : "s"} - review and edit each one below.`);
    } catch (err: any) {
      setError(err?.message || "Couldn't draft answers");
    } finally {
      setDrafting(false);
    }
  }

  function updateAnswer(id: string, answer: string) {
    if (!assistant) return;
    setAssistant({
      ...assistant,
      questions: assistant.questions.map((q) => (q.id === id ? { ...q, answer } : q)),
    });
  }

  async function saveDraft() {
    if (!assistant) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/application-assistant`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: assistant.questions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setAssistant(data.assistant);
      setMessage("Saved.");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(status: "draft" | "ready") {
    if (!assistant) return;
    setMarking(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/grants/${grantId}/application-assistant`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: assistant.questions, status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update status");
      setAssistant(data.assistant);
    } catch (err: any) {
      setError(err?.message || "Failed to update status");
    } finally {
      setMarking(false);
    }
  }

  if (loading) {
    return (
      <WorkspaceShell title="Application Assistant" workspaceId={workspaceId}>
        <p className="text-slate-400">Loading...</p>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Application Assistant" workspaceId={workspaceId}>
      <div className="space-y-6 max-w-3xl">
        <Link href={`/workspace/${workspaceId}/grants/${grantId}/package`} className="text-sm text-[#00E5FF] hover:underline">
          &larr; Back to submission package
        </Link>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F5C542]" />
            <h1 className="text-xl font-bold text-white">Application Assistant</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Paste or upload the funder&apos;s own application - the actual questions they ask, not our
            generic template - and AI drafts an answer to each one using your organization&apos;s profile.
            Review and edit, then copy the answers into the funder&apos;s own web application yourself;
            Grant Scout Pro never submits anything on your behalf.
          </p>
        </Card>

        {eligible === false && (
          <Card className="p-6 border-amber-800 bg-amber-950/20">
            <p className="text-amber-400 text-sm">{reason}</p>
          </Card>
        )}

        {error && (
          <Card className="p-4 border-red-500/20 bg-red-500/10">
            <p className="text-red-400 text-sm">{error}</p>
          </Card>
        )}

        {eligible && !assistant && (
          <Card className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Paste the funder&apos;s application questions
              </label>
              <textarea
                value={questionsText}
                onChange={(e) => {
                  setQuestionsText(e.target.value);
                  if (e.target.value) setFile(null);
                }}
                rows={8}
                placeholder={`Example:\n1. Describe the problem your project addresses (500 words max).\n2. What is your organization's track record with similar work?\n3. Provide a project timeline.`}
                className="w-full p-3 rounded-lg text-black text-sm"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500 uppercase tracking-wide">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Upload the funder&apos;s application file (.pdf, .docx, or .txt)
              </label>
              <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-white/[0.1] rounded-lg text-sm text-slate-200 hover:bg-white/[0.04] cursor-pointer">
                <Upload className="w-4 h-4" />
                {file ? file.name : "Choose file"}
                <input
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                    if (f) setQuestionsText("");
                  }}
                />
              </label>
            </div>

            <button
              onClick={draftAnswers}
              disabled={drafting || (!questionsText.trim() && !file)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#F5C542] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#06131F] font-semibold rounded-lg transition"
            >
              {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {drafting ? "Drafting..." : "Draft Answers with AI"}
            </button>
          </Card>
        )}

        {eligible && assistant && (
          <>
            {message && <p className="text-[#00E5FF] text-sm">{message}</p>}

            <Card className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <FileText className="w-4 h-4" />
                {assistant.sourceType === "uploaded" && assistant.sourceFileName
                  ? `Drafted from ${assistant.sourceFileName}`
                  : "Drafted from pasted application text"}
                <span
                  className={`ml-2 px-2 py-0.5 rounded text-xs uppercase tracking-wide ${
                    assistant.status === "ready" ? "bg-green-500/15 text-green-400" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {assistant.status}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowRedraft((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.1] rounded-md text-[13px] text-slate-200 hover:bg-white/[0.04]"
                >
                  <RotateCcw size={14} />
                  Redraft from new questions
                </button>
                <a
                  href={`/api/workspaces/${workspaceId}/grants/${grantId}/application-assistant/download`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-white/[0.1] rounded-md text-[13px] text-slate-200 hover:bg-white/[0.04]"
                >
                  <Download size={14} />
                  Download as Word
                </a>
              </div>
            </Card>

            {showRedraft && (
              <Card className="p-6 space-y-4 border-amber-800/40">
                <p className="text-amber-400 text-sm">
                  This replaces your current drafted answers for this grant - anything you&apos;ve edited will be lost.
                </p>
                <textarea
                  value={questionsText}
                  onChange={(e) => {
                    setQuestionsText(e.target.value);
                    if (e.target.value) setFile(null);
                  }}
                  rows={6}
                  placeholder="Paste the funder's updated questions..."
                  className="w-full p-3 rounded-lg text-black text-sm"
                />
                <label className="inline-flex items-center gap-2 px-4 py-2 border border-white/[0.1] rounded-lg text-sm text-slate-200 hover:bg-white/[0.04] cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {file ? file.name : "Or choose a file instead"}
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      setFile(f);
                      if (f) setQuestionsText("");
                    }}
                  />
                </label>
                <button
                  onClick={draftAnswers}
                  disabled={drafting || (!questionsText.trim() && !file)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5C542] hover:opacity-90 disabled:opacity-50 text-[#06131F] font-semibold rounded-lg transition"
                >
                  {drafting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {drafting ? "Drafting..." : "Redraft"}
                </button>
              </Card>
            )}

            <div className="space-y-4">
              {assistant.questions.map((q, i) => {
                const wc = wordCount(q.answer);
                const overLimit = q.wordLimit !== null && wc > q.wordLimit;
                return (
                  <Card key={q.id} className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold text-white">
                        {i + 1}. {q.prompt}
                      </p>
                      {q.wordLimit !== null && (
                        <span className={`text-xs shrink-0 ${overLimit ? "text-red-400" : "text-slate-500"}`}>
                          {wc} / {q.wordLimit} words
                        </span>
                      )}
                    </div>
                    <textarea
                      value={q.answer}
                      onChange={(e) => updateAnswer(q.id, e.target.value)}
                      disabled={assistant.status === "ready"}
                      rows={5}
                      className="w-full p-3 rounded-lg text-black text-sm disabled:opacity-70"
                    />
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {assistant.status === "draft" ? (
                <>
                  <button
                    onClick={saveDraft}
                    disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {saving ? "Saving..." : "Save Draft"}
                  </button>
                  <button
                    onClick={() => setStatus("ready")}
                    disabled={marking}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Ready
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setStatus("draft")}
                  disabled={marking}
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-white/[0.1] rounded-lg text-sm text-slate-200 hover:bg-white/[0.04] disabled:opacity-50"
                >
                  Edit Again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </WorkspaceShell>
  );
}

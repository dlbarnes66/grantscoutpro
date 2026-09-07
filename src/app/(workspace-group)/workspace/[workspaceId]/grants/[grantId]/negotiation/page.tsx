"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";

interface Grant {
  id: string;
  title: string;
  agency: string | null;
  deadline: string | null;
}

interface SectionState {
  parsed: any;
  raw: string;
  generatedAt: string;
}

type SectionKey = "scope" | "officer" | "strategy" | "rebuttal" | "budget";

const SECTIONS: { key: SectionKey; title: string; description: string }[] = [
  { key: "scope", title: "Negotiation Scope", description: "What's negotiable, what isn't, and where your leverage is." },
  { key: "officer", title: "Program Officer Talking Points", description: "Prep for a call or meeting with the grant officer." },
  { key: "strategy", title: "Overall Strategy", description: "A step-by-step negotiation plan with fallback options." },
  { key: "rebuttal", title: "Rebuttal Generator", description: "Respond to a specific objection the funder raised." },
  { key: "budget", title: "Budget Negotiation", description: "Justify or adjust the budget ask." },
];

function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-4">
        {value.map((item, i) => (
          <li key={i} className="text-[13px] text-slate-300">
            {typeof item === "string" ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === "object") {
    return (
      <div className="space-y-2">
        {Object.entries(value).map(([k, v]) => (
          <div key={k}>
            <p className="mb-1 text-[11.5px] font-medium uppercase tracking-wide text-slate-500">
              {k.replace(/([A-Z])/g, " $1").trim()}
            </p>
            {renderValue(v)}
          </div>
        ))}
      </div>
    );
  }
  return <p className="whitespace-pre-wrap text-[13px] text-slate-300">{String(value)}</p>;
}

export default function NegotiationPrepPage() {
  const { workspaceId, grantId } = useParams() as { workspaceId: string; grantId: string };

  const [grant, setGrant] = useState<Grant | null>(null);
  const [sections, setSections] = useState<Partial<Record<SectionKey, SectionState>>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<SectionKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orgNotes, setOrgNotes] = useState("");
  const [objection, setObjection] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ai/negotiation?workspaceId=${workspaceId}&grantId=${grantId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load negotiation prep");
      setGrant(json.grant);
      setSections(json.sections || {});
    } catch (err: any) {
      setError(err?.message || "Failed to load negotiation prep");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (workspaceId && grantId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId, grantId]);

  async function generate(key: SectionKey) {
    if (key === "rebuttal" && !objection.trim()) {
      setError("Enter the objection you want a rebuttal for first.");
      return;
    }
    setGenerating(key);
    setError(null);
    try {
      const res = await fetch(`/api/ai/negotiation/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          grantId,
          orgNotes: orgNotes.trim() || undefined,
          ...(key === "rebuttal" ? { objection: objection.trim() } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Generation failed");

      const value = json[key];
      const parsed = typeof value === "string" ? null : value;
      setSections((prev) => ({
        ...prev,
        [key]: { parsed, raw: typeof value === "string" ? value : JSON.stringify(value), generatedAt: new Date().toISOString() },
      }));
    } catch (err: any) {
      setError(err?.message || "Generation failed");
    } finally {
      setGenerating(null);
    }
  }

  return (
    <WorkspaceShell title="Negotiation Prep" workspaceId={workspaceId}>
      {loading ? (
        <p className="text-[13px] text-slate-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          <Card className="p-5">
            <p className="text-[12px] uppercase tracking-wide text-slate-500">Preparing for</p>
            <h1 className="mt-1 text-[16px] font-semibold text-white">{grant?.title || "Grant"}</h1>
            {grant?.agency && <p className="mt-0.5 text-[13px] text-slate-400">{grant.agency}</p>}

            <div className="mt-4">
              <label className="mb-1 block text-[12px] text-slate-400">
                Additional context (optional) - anything specific about your org's position for this negotiation
              </label>
              <textarea
                value={orgNotes}
                onChange={(e) => setOrgNotes(e.target.value)}
                rows={2}
                placeholder="e.g. we can offer to reduce indirect costs, or we have 3 years of matching data..."
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              />
            </div>
          </Card>

          {error && <p className="text-[13px] text-red-400">{error}</p>}

          {SECTIONS.map((section) => {
            const state = sections[section.key];
            const isGenerating = generating === section.key;

            return (
              <Card key={section.key} className="p-5">
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[14px] font-semibold text-white">{section.title}</h2>
                    <p className="text-[12.5px] text-slate-500">{section.description}</p>
                  </div>
                  <button
                    onClick={() => generate(section.key)}
                    disabled={isGenerating}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 text-[12.5px] font-medium text-slate-200 transition-colors hover:bg-white/[0.1] disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} className="text-[#00E5FF]" />}
                    {state ? "Regenerate" : "Generate"}
                  </button>
                </div>

                {section.key === "rebuttal" && (
                  <div className="mb-3">
                    <label className="mb-1 block text-[12px] text-slate-400">Objection to respond to</label>
                    <input
                      value={objection}
                      onChange={(e) => setObjection(e.target.value)}
                      placeholder='e.g. "Your indirect cost rate is too high for our budget policy."'
                      className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
                    />
                  </div>
                )}

                {state ? (
                  <div>
                    {state.parsed ? renderValue(state.parsed) : (
                      <p className="whitespace-pre-wrap text-[13px] text-slate-300">{state.raw}</p>
                    )}
                    <p className="mt-3 text-[11px] text-slate-600">
                      Generated {new Date(state.generatedAt).toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <p className="text-[12.5px] text-slate-600">Not generated yet.</p>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </WorkspaceShell>
  );
}

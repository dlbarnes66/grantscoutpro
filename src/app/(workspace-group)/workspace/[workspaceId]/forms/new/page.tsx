"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import Textarea from "@/components/ui/Textarea";

type FieldType = "text" | "textarea" | "email" | "phone" | "number" | "date" | "select" | "checkbox";

interface FieldDraft {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  helpText?: string;
  options?: string[];
}

const FIELD_TYPES: FieldType[] = ["text", "textarea", "email", "phone", "number", "date", "select", "checkbox"];

function slugify(label: string, existing: Set<string>): string {
  let base = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
  let id = base;
  let i = 1;
  while (existing.has(id)) {
    id = `${base}_${i++}`;
  }
  return id;
}

export default function NewWorkspaceFormPage() {
  const routeParams = useParams();
  const router = useRouter();
  const workspaceId = routeParams.workspaceId as string;

  const [description, setDescription] = useState("");
  const [grants, setGrants] = useState<{ id: string; title: string }[]>([]);
  const [grantId, setGrantId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [fields, setFields] = useState<FieldDraft[]>([]);

  useEffect(() => {
    async function loadGrants() {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/grants/list`);
        const json = await res.json();
        if (res.ok) setGrants((json.grants || []).map((g: any) => ({ id: g.id, title: g.title })));
      } catch {
        // Optional context - fine if this fails silently.
      }
    }
    if (workspaceId) loadGrants();
  }, [workspaceId]);

  async function handleGenerate() {
    if (!description.trim()) {
      setError("Describe the form you want first.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/forms/ai/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), grantId: grantId || undefined }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to generate form");
      setTitle(json.draft.title);
      setFormDescription(json.draft.description || "");
      setFields(json.draft.fields);
    } catch (err: any) {
      setError(err?.message || "Failed to generate form");
    } finally {
      setGenerating(false);
    }
  }

  function addField() {
    const existing = new Set(fields.map((f) => f.id));
    setFields([...fields, { id: slugify("field", existing), type: "text", label: "", required: false }]);
  }

  function updateField(index: number, patch: Partial<FieldDraft>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Give the form a title first.");
      return;
    }
    if (fields.length === 0) {
      setError("Add at least one field.");
      return;
    }
    if (fields.some((f) => !f.label.trim())) {
      setError("Every field needs a label.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: formDescription.trim() || undefined,
          fields,
          grantId: grantId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save form");
      router.push(`/workspace/${workspaceId}/forms/${json.form.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to save form");
      setSaving(false);
    }
  }

  const hasDraft = fields.length > 0;

  return (
    <WorkspaceShell title="New Form" workspaceId={workspaceId}>
      <div className="max-w-3xl space-y-6">
        <Card className="p-5 space-y-3">
          <label className="block text-[13px] font-medium text-slate-300">
            Describe the form you want
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. A volunteer sign-up form for our weekend food drive - name, contact info, shift preference, and any dietary restrictions for the crew meal."
            rows={4}
          />

          {grants.length > 0 && (
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">
                Tie this to a specific grant (optional)
              </label>
              <select
                value={grantId}
                onChange={(e) => setGrantId(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
              >
                <option value="" className="bg-[#0B1B33]">None</option>
                {grants.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#0B1B33]">
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-medium text-[#06131F] hover:opacity-90 disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate with AI"}
          </button>

          {error && <p className="text-[13px] text-red-400">{error}</p>}
        </Card>

        {hasDraft && (
          <Card className="p-5 space-y-4">
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">Form title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[14px] font-medium text-white outline-none focus:border-[#00E5FF]/50"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] text-slate-400">Description (shown to respondents)</label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={2} />
            </div>

            <div className="space-y-3">
              <p className="text-[12px] font-medium uppercase tracking-wide text-slate-400">Fields</p>
              {fields.map((field, index) => (
                <div key={index} className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      placeholder="Field label"
                      className="flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                      className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-1.5 text-[13px] text-white outline-none focus:border-[#00E5FF]/50"
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-[#0B1B33]">
                          {t}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeField(index)}
                      className="rounded-md px-2 text-[12px] text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  {field.type === "select" && (
                    <input
                      value={(field.options || []).join(", ")}
                      onChange={(e) => updateField(index, { options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) })}
                      placeholder="Options, comma separated"
                      className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-white outline-none focus:border-[#00E5FF]/50"
                    />
                  )}
                  <label className="flex items-center gap-2 text-[12px] text-slate-400">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(index, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
              ))}
              <button onClick={addField} className="text-[13px] text-[#00E5FF] hover:underline">
                + Add field
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-[#00E5FF] px-4 py-2 text-[13px] font-medium text-[#06131F] hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Form"}
              </button>
            </div>
          </Card>
        )}

        {!hasDraft && (
          <Card className="p-5">
            <button onClick={addField} className="text-[13px] text-[#00E5FF] hover:underline">
              Or start from a blank field instead of generating one
            </button>
          </Card>
        )}
      </div>
    </WorkspaceShell>
  );
}

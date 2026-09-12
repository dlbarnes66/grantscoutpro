"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface FieldSpec {
  id: string;
  type: string;
  label: string;
  required: boolean;
  helpText?: string;
  options?: string[];
}

interface PublicForm {
  title: string;
  description: string | null;
  fields: FieldSpec[];
  status: "draft" | "published" | "closed";
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSpec;
  value: any;
  onChange: (value: any) => void;
}) {
  const baseClass =
    "w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-[14px] text-slate-100 outline-none focus:border-cyan-400";

  if (field.type === "textarea") {
    return (
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={baseClass}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={baseClass}>
        <option value="">Select...</option>
        {(field.options || []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4"
      />
    );
  }

  const inputType = field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "number" ? "number" : field.type === "date" ? "date" : "text";

  return (
    <input
      type={inputType}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className={baseClass}
    />
  );
}

export default function PublicFormPage() {
  const routeParams = useParams();
  const shareSlug = routeParams.shareSlug as string;

  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/forms/public/${shareSlug}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load form");
        if (!cancelled) setForm(json.form);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load form");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (shareSlug) load();
    return () => {
      cancelled = true;
    };
  }, [shareSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/forms/public/${shareSlug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: values }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to submit");
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#06131F] flex items-start justify-center px-4 py-16">
      <div className="w-full max-w-xl">
        {loading && <p className="text-slate-400">Loading...</p>}

        {notFound && !loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-300">This form isn't available.</p>
          </div>
        )}

        {form && !submitted && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-800 bg-slate-900 p-8 space-y-5">
            <div>
              <h1 className="text-xl font-semibold text-white">{form.title}</h1>
              {form.description && <p className="mt-2 text-[14px] text-slate-400">{form.description}</p>}
            </div>

            {form.status === "closed" ? (
              <p className="text-amber-400 text-[14px]">This form is no longer accepting responses.</p>
            ) : (
              <>
                {form.fields.map((field) => (
                  <div key={field.id} className={field.type === "checkbox" ? "flex items-center gap-2" : ""}>
                    <label className="mb-1 block text-[13px] font-medium text-slate-300">
                      {field.label}
                      {field.required && <span className="text-red-400"> *</span>}
                    </label>
                    <FieldInput
                      field={field}
                      value={values[field.id]}
                      onChange={(v) => setValues((prev) => ({ ...prev, [field.id]: v }))}
                    />
                    {field.helpText && <p className="mt-1 text-[12px] text-slate-500">{field.helpText}</p>}
                  </div>
                ))}

                {error && <p className="text-[13px] text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-md bg-cyan-400 px-4 py-2.5 text-[14px] font-semibold text-[#06131F] hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </>
            )}
          </form>
        )}

        {submitted && (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-lg font-semibold text-white">Thanks!</p>
            <p className="mt-2 text-[14px] text-slate-400">Your response has been submitted.</p>
          </div>
        )}
      </div>
    </div>
  );
}

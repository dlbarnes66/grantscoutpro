"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function GrantWritePage() {
  const { id } = useParams();
  const [grant, setGrant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [writing, setWriting] = useState(false);

  useEffect(() => {
    const loadGrant = async () => {
      const res = await fetch(`/api/grants/${id}`);
      const data = await res.json();
      setGrant(data);
      setLoading(false);
    };

    loadGrant();
  }, [id]);

  const runWriter = async () =>
  {
    if (!prompt.trim()) return;

    setWriting(true);

    const res = await fetch("/api/ai/write", {
      method: "POST",
      body: JSON.stringify({
        grantId: id,
        prompt,
      }),
    });

    const data = await res.json();
    setOutput(data.output || "");
    setWriting(false);
  };

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading grant writer…
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="text-center text-red-600 text-lg py-20">
        Grant not found.
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          AI Writer for {grant.title}
        </h1>
        <p className="text-muted mt-2">
          Generate tailored proposal content using AI.
        </p>
      </div>

      {/* Grant Summary */}
      <div className="card">
        <h2 className="section-title">Grant Overview</h2>

        <p className="text-gray-700 mt-2 leading-relaxed">
          {grant.summary || "No summary available."}
        </p>

        <div className="mt-4 space-y-1 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Amount:</span> {grant.amount || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Deadline:</span> {grant.deadline || "N/A"}
          </p>
        </div>
      </div>

      {/* Prompt Input */}
      <div className="card">
        <h2 className="section-title">Your Instructions</h2>
        <p className="text-muted mt-2">
          Describe what you want the AI to write. Include tone, structure, or specific requirements.
        </p>

        <textarea
          className="textarea mt-4 w-full h-48"
          placeholder="Example: Write a 2‑page narrative explaining how our nonprofit will use this funding to expand youth programs…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      {/* Generate Button */}
      <button
        onClick={runWriter}
        disabled={writing}
        className="btn btn-primary"
      >
        {writing ? "Generating…" : "Generate Proposal Content"}
      </button>

      {/* Output */}
      {output && (
        <div className="card">
          <h2 className="section-title">Generated Draft</h2>

          <textarea
            className="textarea mt-4 w-full h-96"
            value={output}
            readOnly
          />
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 flex gap-4">
        <Link href={`/dashboard/grants/${id}`} className="btn btn-secondary">
          Back to Grant
        </Link>

        <Link href="/dashboard" className="btn btn-success">
          Dashboard Home
        </Link>
      </div>
    </div>
  );
}

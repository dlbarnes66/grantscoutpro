"use client";

import { useState } from "react";

export function GrantActions({ grantId }: { grantId: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function runAI() {
    try {
      setLoading("ai");
      setMessage(null);

      const res = await fetch(`/api/grant/${grantId}/ai`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "AI analysis failed");

      setMessage("AI analysis completed.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function saveGrant() {
    try {
      setLoading("save");
      setMessage(null);

      const res = await fetch(`/api/grant/save`, {
        method: "POST",
        body: JSON.stringify({ grantId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Save failed");

      setMessage("Grant saved.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(null);
    }
  }

  async function compareGrant() {
    try {
      setLoading("compare");
      setMessage(null);

      const res = await fetch(`/api/grant/compare`, {
        method: "POST",
        body: JSON.stringify({ grantId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Compare failed");

      setMessage("Comparison created.");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex gap-3">
        <button
          onClick={runAI}
          disabled={loading === "ai"}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading === "ai" ? "Running AI..." : "Run AI Analysis"}
        </button>

        <button
          onClick={saveGrant}
          disabled={loading === "save"}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "save" ? "Saving..." : "Save Grant"}
        </button>

        <button
          onClick={compareGrant}
          disabled={loading === "compare"}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "compare" ? "Comparing..." : "Compare"}
        </button>
      </div>

      {message && (
        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
          {message}
        </p>
      )}
    </div>
  );
}

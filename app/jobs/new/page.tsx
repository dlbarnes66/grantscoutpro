"use client";

import { useState } from "react";

export default function CreateJobPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function submitJob(e) {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      window.location.href = `/jobs/${data.jobId}`;
    } else {
      console.error("Job creation failed:", await res.text());
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Create New Job</h1>

        <form onSubmit={submitJob} className="space-y-6">
          <div>
            <label className="block font-medium mb-2">
              Grant Search Query
            </label>
            <textarea
              className="w-full px-4 py-3 border rounded-lg shadow-sm min-h-[120px]"
              placeholder="Describe the type of grants you're looking for..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Creating Job..." : "Create Job"}
          </button>
        </form>
      </div>
    </div>
  );
}

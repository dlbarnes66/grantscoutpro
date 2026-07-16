"use client";

import { useState } from "react";
import { useGrantMatching } from "@/hooks/useGrantMatching";
import { Sparkles, Loader2 } from "lucide-react";

export default function GrantMatchingForm() {
  const { match, loading, error } = useGrantMatching();

  const [organizationType, setOrganizationType] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await match({
      organizationType,
      projectDescription,
      location,
      budget,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-white border rounded-xl shadow-sm space-y-4"
    >
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-blue-600" />
        Grant Matching Engine
      </h2>

      <div>
        <label className="text-sm text-gray-700">Organization Type</label>
        <input
          type="text"
          value={organizationType}
          onChange={(e) => setOrganizationType(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder="Nonprofit, school, municipality…"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700">Project Description</label>
        <textarea
          value={projectDescription}
          onChange={(e) => setProjectDescription(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder="Describe your project goals, purpose, and impact…"
          rows={4}
        />
      </div>

      <div>
        <label className="text-sm text-gray-700">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder="City, state, region…"
        />
      </div>

      <div>
        <label className="text-sm text-gray-700">Budget</label>
        <input
          type="text"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full border rounded px-3 py-2 mt-1"
          placeholder="$50,000"
        />
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Match Grants
      </button>
    </form>
  );
}

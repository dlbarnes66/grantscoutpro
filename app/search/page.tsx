"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  async function fetchHistory() {
    const res = await fetch("/api/search-history", {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setHistory(data.history || []);
    }
  }

  async function submitSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query }),
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      window.location.href = `/jobs/${data.jobId}`;
    } else {
      console.error("Search failed:", await res.text());
      setLoading(false);
    }
  }

  async function saveSearch() {
    if (!query.trim()) return;

    setSaving(true);

    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: query,
        query,
      }),
    });

    if (res.ok) {
      setSavedMessage("Saved!");
      setTimeout(() => setSavedMessage(""), 2000);
    } else {
      console.error("Failed to save search");
    }

    setSaving(false);
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50">
      <h1 className="text-4xl font-bold text-center mb-10">
        AI Grant Search
      </h1>

      {/* Search Bar */}
      <form
        onSubmit={submitSearch}
        className="max-w-2xl mx-auto flex gap-3 mb-6"
      >
        <input
          type="text"
          placeholder="Search for grants, keywords, agencies..."
          className="flex-1 px-4 py-3 border rounded-lg shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 rounded-lg shadow text-white font-semibold transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Save Search Button */}
      <div className="max-w-2xl mx-auto flex justify-end mb-10">
        <button
          onClick={saveSearch}
          disabled={saving || !query.trim()}
          className={`px-4 py-2 rounded-lg text-white font-medium transition ${
            saving || !query.trim()
              ? "bg-gray-400"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving..." : "Save Search"}
        </button>
      </div>

      {/* Saved Message */}
      {savedMessage && (
        <p className="text-center text-green-600 font-medium mb-6">
          {savedMessage}
        </p>
      )}

      {/* Search History */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>

        {history.length === 0 ? (
          <p className="text-gray-600">No recent searches.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <Link
                key={item.id}
                href={`/jobs/${item.jobId}`}
                className="block p-4 border rounded-lg bg-white hover:bg-gray-50 transition"
              >
                <div className="font-medium">{item.query}</div>
                <div className="text-sm text-gray-600">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

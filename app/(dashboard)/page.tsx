"use client";

import SearchBar from "@/components/SearchBar";
import SearchResults from "@/components/SearchResults";
import { Sparkles, LayoutGrid, FileText, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">
              GrantScout Pro
            </span>
          </div>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <button className="flex items-center gap-1 hover:text-gray-900">
              <LayoutGrid className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button className="flex items-center gap-1 hover:text-gray-900">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </button>
            <button className="flex items-center gap-1 hover:text-gray-900">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: semantic search panel */}
          <section className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                AI Workspace Semantic Search
              </h1>
              <p className="text-gray-600 mt-1">
                Search across all grants, requirements, and documents in your workspace
                with AI‑powered relevance ranking.
              </p>
            </div>

            <div className="space-y-6">
              <SearchBar />
              <SearchResults />
            </div>
          </section>

          {/* Right: overview / stats / helper */}
          <aside className="space-y-4">
            <div className="p-4 bg-white rounded-xl shadow-sm border">
              <h2 className="text-sm font-semibold text-gray-800 mb-2">
                Workspace Overview
              </h2>
              <p className="text-sm text-gray-600">
                Quickly find funding opportunities, eligibility criteria, and key requirements
                without digging through documents manually.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl shadow-sm border space-y-3">
              <h2 className="text-sm font-semibold text-gray-800">
                Tips for better results
              </h2>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Search by eligibility (e.g. “nonprofit, rural, healthcare”).</li>
                <li>• Search by funding focus (e.g. “veterans housing”, “STEM education”).</li>
                <li>• Search by requirement (e.g. “matching funds”, “3 years of financials”).</li>
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-900">
              <p className="font-semibold mb-1">AI‑powered engine</p>
              <p>
                Results are ranked using OpenAI embeddings and semantic similarity,
                giving you the most relevant grants first.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

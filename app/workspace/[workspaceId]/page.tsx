"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function WorkspaceDashboard({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const [docs, setDocs] = useState<any[]>([]);
  const [searches, setSearches] = useState<any[]>([]);
  const [summary, setSummary] = useState<string>("Loading AI summary...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/dashboard`);
      const json = await res.json();

      setDocs(json.documents || []);
      setSearches(json.searches || []);
      setSummary(json.summary || "No AI summary available.");
      setLoading(false);
    };

    loadDashboard();
  }, [workspaceId]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Workspace Dashboard</h1>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href={`/workspaces/${workspaceId}/upload`}>
          <Button>Upload File</Button>
        </Link>

        <Link href={`/workspaces/${workspaceId}/search`}>
          <Button>Semantic Search</Button>
        </Link>

        <Link href={`/workspaces/${workspaceId}/chat`}>
          <Button>AI Chat</Button>
        </Link>
      </div>

      {/* AI Summary */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-2">AI Workspace Summary</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {loading ? "Loading..." : summary}
        </p>
      </Card>

      {/* Recent Documents */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Documents</h2>

        {docs.length === 0 && (
          <p className="text-gray-600">No documents uploaded yet.</p>
        )}

        <div className="space-y-3">
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-semibold">{doc.name}</p>
                <p className="text-sm text-gray-600">{doc.mimeType}</p>
              </div>

              <Link
                href={`/workspaces/${workspaceId}/documents/${doc.id}/view`}
              >
                <Button>Open</Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Searches */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Searches</h2>

        {searches.length === 0 && (
          <p className="text-gray-600">No searches yet.</p>
        )}

        <div className="space-y-2">
          {searches.map((s, idx) => (
            <p key={idx} className="text-gray-700">
              • {s.query}
            </p>
          ))}
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function DocumentListPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocs = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/documents`);
      const json = await res.json();
      setDocs(json.documents || []);
      setLoading(false);
    };

    loadDocs();
  }, [workspaceId]);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>

      {loading && <p className="text-gray-600">Loading documents...</p>}

      {!loading && docs.length === 0 && (
        <Card className="p-4">
          <p className="text-gray-600">No documents uploaded yet.</p>
        </Card>
      )}

      <div className="space-y-4">
        {docs.map((doc) => (
          <Card key={doc.id} className="p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold">{doc.name}</p>
              <p className="text-sm text-gray-600">{doc.mimeType}</p>
            </div>

            <Link
              href={`/workspaces/${workspaceId}/documents/${doc.id}/view`}
            >
              <Button>Open</Button>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import GrantIntelligenceDashboard from "./GrantIntelligenceDashboard";

export default function DocumentPage() {
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const documentId = params.documentId as string;

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="shrink-0 bg-[#0A1A2F] border-b border-slate-800 px-4 py-2">
        <Link
          href={`/workspace/${workspaceId}/documents`}
          className="text-sm text-slate-300 hover:text-[#00E5FF] transition"
        >
          ← Back to Documents
        </Link>
      </div>
      <div className="flex-1 min-h-0">
        <GrantIntelligenceDashboard
          workspaceId={workspaceId}
          documentId={documentId}
          userId="current-user"
        />
      </div>
    </div>
  );
}

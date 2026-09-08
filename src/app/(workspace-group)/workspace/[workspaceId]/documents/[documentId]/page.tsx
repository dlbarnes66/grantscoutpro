"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";
import GrantIntelligenceDashboard from "./GrantIntelligenceDashboard";

export default function DocumentPage() {
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const documentId = params.documentId as string;

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="shrink-0 bg-[#0A1A2F] border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <Link
          href={`/workspace/${workspaceId}/documents`}
          className="text-sm text-slate-300 hover:text-[#00E5FF] transition"
        >
          ← Back to Documents
        </Link>
        <Link
          href={`/workspace/${workspaceId}/documents/${documentId}/print`}
          className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-[#00E5FF] transition"
        >
          <Printer size={14} />
          Print / Download PDF
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

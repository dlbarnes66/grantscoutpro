"use client";

import { useParams } from "next/navigation";
import GrantIntelligenceDashboard from "./GrantIntelligenceDashboard";

export default function DocumentPage() {
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const documentId = params.documentId as string;

  return (
    <div className="h-screen w-screen">
      <GrantIntelligenceDashboard
        workspaceId={workspaceId}
        documentId={documentId}
        userId="current-user"
      />
    </div>
  );
}
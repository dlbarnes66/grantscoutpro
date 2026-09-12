"use client";

import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import GrantComparisonPanel from "@/components/grants/GrantComparisonPanel";
import { ArrowLeft } from "lucide-react";

export default function CompareGrantsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const searchParams = useSearchParams();

  const idsParam = searchParams.get("ids") || "";
  const grantIds = idsParam
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return (
    <WorkspaceShell title="Compare Grants" workspaceId={workspaceId}>
      <div className="space-y-6">
        <Link
          href={`/workspace/${workspaceId}/grants`}
          className="inline-flex items-center gap-1.5 text-sm text-[#00E5FF] hover:underline"
        >
          <ArrowLeft size={14} />
          Back to Grants
        </Link>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">Compare Grants</h1>
          <GrantComparisonPanel workspaceId={workspaceId} grantIds={grantIds} />
        </Card>
      </div>
    </WorkspaceShell>
  );
}

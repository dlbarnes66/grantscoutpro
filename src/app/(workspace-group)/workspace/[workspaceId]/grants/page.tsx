"use client";

import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import Card from "@/components/ui/Card";
import { WorkspaceLocation } from "@/types/workspace";

export default function WorkspaceGrantsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  // Replace with real fetch later
  const location: WorkspaceLocation = {
    id: "loc-1",
    city: "Unknown",
    state: "Unknown",
    county: "Unknown",
  };

  return (
    <WorkspaceShell title="Grant Opportunities" workspaceId={workspaceId}>
      <Card className="p-6 space-y-3">
        <h1 className="text-2xl font-bold">Grant Opportunities</h1>

        <p className="text-slate-300">
          Showing grants for:
          <br />
          <strong>City:</strong> {location.city ?? "N/A"}
          <br />
          <strong>State:</strong> {location.state ?? "N/A"}
          <br />
          <strong>County:</strong> {location.county ?? "N/A"}
        </p>
      </Card>
    </WorkspaceShell>
  );
}

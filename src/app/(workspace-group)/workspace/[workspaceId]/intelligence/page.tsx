"use client";

import { useParams } from "next/navigation";
import { useWorkspaceLocations } from "@/hooks/useWorkspaceLocations";
import LocationIntelligenceCard from "@/components/intelligence/LocationIntelligenceCard";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspaceIntelligencePage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  const { location, loading } = useWorkspaceLocations(workspaceId);

  return (
    <WorkspaceShell title="Location Intelligence" workspaceId={workspaceId}>
      <h1 className="text-2xl font-semibold mb-6">
        Location Intelligence Dashboard
      </h1>

      {loading && <div>Loading workspace locations…</div>}

      {!loading && !location && (
        <div className="text-gray-400">
          No locations found. Add a location in Location Settings.
        </div>
      )}

      {!loading && location && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LocationIntelligenceCard key={location.id} location={location} />
        </div>
      )}
    </WorkspaceShell>
  );
}

"use client";

import { useParams } from "next/navigation";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";
import WorkspaceGrantProfileSettings from "@/components/workspace/WorkspaceGrantProfileSettings";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function GrantProfileSettingsPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;

  return (
    <WorkspaceShell title="Grant Profile" workspaceId={workspaceId}>
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: `/workspace/${workspaceId}` },
          { label: "Workspace Settings", href: `/workspace/${workspaceId}/settings` },
          { label: "Grant Profile" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-xl font-bold">Grant Profile</h1>
        <p className="mt-1 text-sm text-slate-400">
          The organization details used to find and score grant matches - website, social
          media, location, tax IDs, budget, focus areas and goals. Anything skipped during
          onboarding can be added here.
        </p>
      </div>

      <WorkspaceGrantProfileSettings workspaceId={workspaceId} />
    </WorkspaceShell>
  );
}

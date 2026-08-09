import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";
import { loadGrantIntelligence } from "../../../grants/_lib/loadGrantIntelligence";

interface GrantPageProps {
  params: {
    dashboardId: string;
    grant: string;
  };
}

export default async function GrantPage({ params }: GrantPageProps) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="text-center py-20 text-slate-300">
        <p>You must be logged in to view this grant.</p>
      </div>
    );
  }

  const grantData = await prisma.grant.findUnique({
    where: { id: params.grant },
  });

  if (!grantData) {
    return (
      <div className="text-center py-20 text-slate-300">
        <p>Grant not found.</p>
      </div>
    );
  }

  const intelligence = await loadGrantIntelligence(
    params.grant,
    grantData.workspaceId
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Grant Details</h1>

      <div className="rounded border border-slate-800 bg-slate-900/60 p-6">
        <pre className="text-slate-300 text-sm">
          {JSON.stringify({ grantData, intelligence }, null, 2)}
        </pre>
      </div>
    </div>
  );
}

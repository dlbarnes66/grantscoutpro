import React from "react";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/nextauth";

export default async function DashboardSearchPage({
  params,
}: {
  params: { dashboardId: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  if (!userId) {
    return <div className="text-slate-300 text-sm">Not authenticated.</div>;
  }

  const workspace = await prisma.workspace.findFirst({
    where: { members: { some: { userId } } },
  });

  if (!workspace) {
    return <div className="text-slate-300 text-sm">Workspace not found.</div>;
  }

  return (
    <div className="text-slate-200">
      Search page for workspace: {workspace.name}
    </div>
  );
}

import React from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "next-auth";
import { loadGrantIntelligence } from "../../../grants/_lib/loadGrantIntelligence";

export default async function GrantPage({
  params,
}: {
  params: { workspaceId: string; grant: string };
}) {
  const session = await auth();

  const grantData = await prisma.grant.findUnique({
    where: { id: params.grant },
  });

  // FIXED: loadGrantIntelligence requires (grantId, workspaceId)
  const intelligence = await loadGrantIntelligence(
    params.grant,
    params.workspaceId
  );

  return (
    <div>
      <h1>Grant Details</h1>
      <pre>{JSON.stringify({ grantData, intelligence }, null, 2)}</pre>
    </div>
  );
}

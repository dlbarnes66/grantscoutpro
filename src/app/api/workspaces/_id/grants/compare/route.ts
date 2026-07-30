export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { filterViewableGrants } from "@/lib/security/grant-acl";

export async function POST(req, { params }) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { grantIds } = await req.json();

  if (!Array.isArray(grantIds) || grantIds.length === 0) {
    return NextResponse.json(
      { error: "No grant IDs provided" },
      { status: 400 }
    );
  }

  // ACL filtering
  const allowed = await filterViewableGrants(userId, grantIds);
  const filteredIds = grantIds.filter(id => allowed.includes(id));

  if (filteredIds.length === 0) {
    return NextResponse.json(
      { error: "No viewable grants found" },
      { status: 403 }
    );
  }

  // Load grants
  const grants = await prisma.grant.findMany({
    where: { id: { in: filteredIds } }
  });

  return NextResponse.json({ success: true, grants });
}

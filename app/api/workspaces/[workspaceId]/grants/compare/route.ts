import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { filterViewableGrants } from "@/lib/security/grant-acl";

export async function POST(req, { params }) {
  const { workspaceId } = params;

  const auth = getAuth(req);
  const userId = auth.userId;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { grantIds } = await req.json();

  if (!Array.isArray(grantIds) || grantIds.length === 0) {
    return NextResponse.json({ error: "No grants provided" }, { status: 400 });
  }

  // ACL: filter grants user can view
  const allowed = await filterViewableGrants(userId, grantIds);

  const filteredIds = grantIds.filter(id => allowed.has(id));

  if (filteredIds.length === 0) {
    return NextResponse.json(
      { error: "You do not have permission to view any of these grants" },
      { status: 403 }
    );
  }

  // Load allowed grants
  const grants = await prisma.grant.findMany({
    where: { id: { in: filteredIds } },
    select: {
      id: true,
      title: true,
      agency: true,
      deadline: true,
      summary: true,
    },
  });

  // Example comparison logic (replace with your real logic)
  const comparison = grants.map(g => ({
    id: g.id,
    title: g.title,
    agency: g.agency,
    deadline: g.deadline,
    score: Math.random() * 100, // placeholder
  }));

  return NextResponse.json({
    compared: comparison,
    ignored: grantIds.filter(id => !allowed.has(id)),
  });
}

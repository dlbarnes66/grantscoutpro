import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const { userId, sessionClaims } = await await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = sessionClaims?.orgId as string | undefined;
  const role = sessionClaims?.role as string | undefined;
  const superAdmin = sessionClaims?.superAdmin as boolean | undefined;
  const isOrgAdmin = role === "org_admin";
  const isSuperAdmin = !!superAdmin;
  return NextResponse.json({
    success: true,
    orgId: orgId ?? null,
    permissions: {
      isOrgAdmin,
      isSuperAdmin,
      canManageOrg: isOrgAdmin || isSuperAdmin,
    },
  });
}

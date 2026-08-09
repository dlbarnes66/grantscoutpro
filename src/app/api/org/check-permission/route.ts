import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id as string | undefined;
    const orgId = session?.user?.orgId as string | undefined;
    const role = session?.user?.role as string | undefined;
    const superAdmin = session?.user?.superAdmin as boolean | undefined;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
  } catch (err: any) {
    console.error("ORG CHECK PERMISSION ERROR:", err);
    return NextResponse.json({ error: err.message ?? "Internal error" }, { status: 500 });
  }
}

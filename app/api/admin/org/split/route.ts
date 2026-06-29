import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { sourceOrgId, newOrgs } = await req.json();

    if (!sourceOrgId || !newOrgs || !Array.isArray(newOrgs)) {
      return NextResponse.json(
        { error: "Missing sourceOrgId or newOrgs array" },
        { status: 400 }
      );
    }

    // Create new organizations
    const createdOrgs = [];
    for (const org of newOrgs) {
      const newOrg = await prisma.organization.create({
        data: {
          name: org.name,
          subscriptionStatus: "none",
        },
      });
      createdOrgs.push(newOrg);
    }

    return NextResponse.json({
      createdOrgs,
      message: "Organizations created. Use /move-members, /move-applications, /move-audit to complete split."
    });
  } catch (err: any) {
    console.error("Org split error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

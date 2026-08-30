import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/route-guards";

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json();

  const workspace = await prisma.workspace.create({
    data: {
      name: body.name || "New Workspace",
      ownerId: user.id,
      slug: body.slug || `ws-${Date.now()}`,
      billing: {
        create: {
          plan: "starter",
          seats: 1,
          aiTokensMonthly: 50000,
          aiTokensUsed: 0,
          documentLimit: 50,
          storageLimitMb: 500,
          suspended: false
        }
      },
      members: {
        create: {
          userId: user.id,
          role: "owner",
          status: "active"
        }
      }
    }
  });

  return NextResponse.json(workspace);
}

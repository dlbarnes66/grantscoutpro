import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { users } = await req.json();

    if (!users || !Array.isArray(users)) {
      return NextResponse.json({ error: "Missing users array" }, { status: 400 });
    }

    let created = 0;
    let updated = 0;

    for (const u of users) {
      const existing = await prisma.user.findUnique({
        where: { email: u.email },
      });

      if (existing) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: u.name,
            role: u.role,
            subscriptionStatus: u.subscriptionStatus,
          },
        });
        updated++;
      } else {
        await prisma.user.create({
          data: {
            email: u.email,
            name: u.name,
            role: u.role,
            subscriptionStatus: u.subscriptionStatus ?? "none",
          },
        });
        created++;
      }
    }

    return NextResponse.json({ created, updated });
  } catch (err: any) {
    console.error("User sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

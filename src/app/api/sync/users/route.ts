export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export async function POST(req: Request) {
  try {
    const users = await req.json();

    if (!Array.isArray(users)) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    let created = 0;
    let updated = 0;

    for (const u of users) {
      if (!u.id) continue;

      const existing = await prisma.user.findUnique({
        where: { id: u.id },
      });

      if (!existing) {
        // Create only fields that actually exist in your User model
        await prisma.user.create({
          data: {
            id: u.id,
            name: u.name ?? null,
            email: u.email ?? null,
            image: u.image ?? null,
            stripeCustomerId: u.stripeCustomerId ?? null,
          },
        });
        created++;
      } else {
        // Update only fields that actually exist
        await prisma.user.update({
          where: { id: u.id },
          data: {
            name: u.name ?? existing.name,
            email: u.email ?? existing.email,
            image: u.image ?? existing.image,
            stripeCustomerId: u.stripeCustomerId ?? existing.stripeCustomerId,
          },
        });
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      created,
      updated,
    });
  } catch (err: any) {
    console.error("USER SYNC ERROR:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

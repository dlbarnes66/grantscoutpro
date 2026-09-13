import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PLANS, PlanId } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Superadmin tool for granting a comped pilot to a client for free,
// outside of Stripe entirely. Same auth pattern as
// /api/admin/workspace/update. The pilot lives on the client's Org
// (pilotTier/pilotStart/pilotEndsAt - see resolveEffectivePlanId in
// src/lib/plans.ts) since plans are billed per-org, not per-workspace.
//
// GET  -> list every org that currently has (or ever had) a pilot on file
// POST -> grant/extend a pilot for the org owning the given email's account
// DELETE -> end a pilot early (clears the pilot fields; the org falls
//           straight back to its normal tier on the next request)

function requireSuperAdmin(sessionClaims: any) {
  return !!sessionClaims?.superAdmin;
}

export async function GET(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !requireSuperAdmin(sessionClaims)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgs = await prisma.org.findMany({
    where: { pilotTier: { not: null } },
    select: {
      id: true,
      name: true,
      tier: true,
      pilotTier: true,
      pilotStart: true,
      pilotEndsAt: true,
      users: { select: { id: true, email: true, name: true } },
    },
    orderBy: { pilotStart: "desc" },
  });

  return NextResponse.json({ success: true, orgs });
}

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !requireSuperAdmin(sessionClaims)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const tier = typeof body.tier === "string" ? body.tier : "";
  const durationDays = Number(body.durationDays);

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (!tier || !(tier in PLANS)) {
    return NextResponse.json({ error: `tier must be one of: ${Object.keys(PLANS).join(", ")}` }, { status: 400 });
  }
  if (!Number.isFinite(durationDays) || durationDays < 1 || durationDays > 365) {
    return NextResponse.json({ error: "durationDays must be a number between 1 and 365" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, orgId: true },
  });

  if (!user) {
    return NextResponse.json(
      { error: `No account found for ${email}. They need to sign up at grantscoutpro.com first.` },
      { status: 404 }
    );
  }

  let orgId = user.orgId;
  if (!orgId) {
    const org = await prisma.org.create({
      data: { name: user.name ? `${user.name}'s Organization` : "My Organization", tier: "basic" },
    });
    await prisma.user.update({ where: { id: user.id }, data: { orgId: org.id } });
    orgId = org.id;
  }

  const pilotStart = new Date();
  const pilotEndsAt = new Date(pilotStart.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const org = await prisma.org.update({
    where: { id: orgId },
    data: {
      pilotTier: tier as PlanId,
      pilotStart,
      pilotEndsAt,
    },
  });

  return NextResponse.json({ success: true, org });
}

export async function DELETE(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId || !requireSuperAdmin(sessionClaims)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const orgId = typeof body.orgId === "string" ? body.orgId : "";
  if (!orgId) {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 });
  }

  const org = await prisma.org.update({
    where: { id: orgId },
    data: { pilotTier: null, pilotStart: null, pilotEndsAt: null },
  });

  return NextResponse.json({ success: true, org });
}

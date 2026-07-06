// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { addonEnforcement } from "@/lib/addonEnforcement";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // -----------------------------
  // 1. Add‑On Enforcement (API)
  // -----------------------------
  const addonCheck = addonEnforcement(req);
  if (addonCheck !== true) {
    return addonCheck; // pass through Response
  }

  // -----------------------------
  // 2. Subscription + Trial Enforcement (Dashboard)
  // -----------------------------
  if (!pathname.startsWith("/dashboard/workspace")) {
    return NextResponse.next();
  }

  const workspaceId = pathname.split("/")[3];
  if (!workspaceId) {
    return NextResponse.next();
  }

  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      trialEndAt: true,
      isLocked: true,
    },
  });

  if (!workspace) {
    return NextResponse.next();
  }

  // -----------------------------
  // Trial expired → lock workspace
  // -----------------------------
  if (workspace.trialEndAt && workspace.trialEndAt < new Date()) {
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { isLocked: true },
    });

    return NextResponse.redirect(
      new URL(`/dashboard/workspace/${workspaceId}/billing`, req.url)
    );
  }

  // -----------------------------
  // Locked → redirect to billing
  // -----------------------------
  if (workspace.isLocked) {
    return NextResponse.redirect(
      new URL(`/dashboard/workspace/${workspaceId}/billing`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/workspace/:path*"],
};

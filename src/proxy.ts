import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "./lib/prisma";

// ---------------------------------------------------------
// PUBLIC ROUTES (no auth required)
// ---------------------------------------------------------
const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing(.*)",
  "/features(.*)",
  "/docs(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/blog(.*)",

  // Clerk auth routes (must be catch-all)
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;

  // ---------------------------------------------------------
  // PUBLIC ROUTES ALWAYS PASS THROUGH
  // ---------------------------------------------------------
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // ---------------------------------------------------------
  // AUTH REDIRECTS (only for NON-public routes)
  // ---------------------------------------------------------
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // ---------------------------------------------------------
  // WORKSPACE ROUTE ENFORCEMENT
  // ---------------------------------------------------------
  if (pathname.startsWith("/api/workspaces/")) {
    const parts = pathname.split("/");
    const workspaceId = parts[3];

    if (!workspaceId) {
      return NextResponse.json(
        { error: "workspaceId missing in route." },
        { status: 400 }
      );
    }

    // Billing record (includes suspension flags)
    const billing = await prisma.workspaceBilling.findFirst({
  where: { workspaceId },
  select: {
    plan: true,
    seats: true,
    aiTokensMonthly: true,
    aiTokensUsed: true,
    documentLimit: true,
    storageLimitMb: true,
  },
});

    if (!billing) {
      return NextResponse.json(
        { error: "Billing record not found for workspace." },
        { status: 500 }
      );
    }

    // Workspace suspension
    

    // Seat enforcement
    const activeMembers = await prisma.workspaceMember.count({
      where: { workspaceId, status: "active" },
    });

    if (activeMembers > billing.seats) {
      return NextResponse.json(
        {
          error: "Workspace has exceeded its seat limit.",
          seatsAllowed: billing.seats,
          seatsUsed: activeMembers,
        },
        { status: 403 }
      );
    }

    // User must have an active seat
    const member = await prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: "active" },
      select: { id: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "You do not have an active seat in this workspace." },
        { status: 403 }
      );
    }

    // AI token limits
    if (pathname.includes("/ai/")) {
      if (billing.aiTokensUsed >= billing.aiTokensMonthly) {
        return NextResponse.json(
          {
            error: "AI usage limit reached for this billing period.",
            tokensAllowed: billing.aiTokensMonthly,
            tokensUsed: billing.aiTokensUsed,
          },
          { status: 403 }
        );
      }
    }

    // Document limits
    if (pathname.includes("/documents/create")) {
      const docCount = await prisma.workspaceDocument.count({
        where: { workspaceId },
      });

      if (docCount >= billing.documentLimit) {
        return NextResponse.json(
          {
            error: "Document limit reached for your plan.",
            documentsAllowed: billing.documentLimit,
            documentsUsed: docCount,
          },
          { status: 403 }
        );
      }
    }

    // Storage limits
    if (pathname.includes("/storage/upload")) {
      const totalStorage = await prisma.workspaceDocument.aggregate({
        where: { workspaceId },
        _sum: { sizeBytes: true },
      });

      const usedMb = (totalStorage._sum.sizeBytes || 0) / (1024 * 1024);

      if (usedMb >= billing.storageLimitMb) {
        return NextResponse.json(
          {
            error: "Storage limit reached for your plan.",
            storageAllowedMb: billing.storageLimitMb,
            storageUsedMb: usedMb,
          },
          { status: 403 }
        );
      }
    }

    // Feature flags
    if (pathname.includes("/ai/improve") && billing.plan === "starter") {
      return NextResponse.json(
        { error: "AI Improve is not available on the Starter plan." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
});

// ---------------------------------------------------------
// NEXT.JS 16 PROXY CONFIG — STATIC ASSETS MUST BYPASS CLERK
// ---------------------------------------------------------
export const config = {
  matcher: [
    // DO NOT TOUCH STATIC ASSETS
    "/((?!_next/static|_next/image|favicon.ico).*)",

    // Allow webhooks to bypass Clerk
    "/api/webhooks/(.*)",

    // Protect all other API routes
    "/api/(.*)",
  ],
};

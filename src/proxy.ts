import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
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

  // Clerk auth routes
  "/sign-in(.*)",
  "/sign-up(.*)",

  // Internal cron endpoints - these are hit by an external scheduler
  // (Railway Cron / cron-job.org), so there's no logged-in Clerk user in
  // that request. Without this, Clerk redirected every cron hit straight
  // to /sign-in before the route ever ran, silently breaking grant
  // scanning and deadline notifications. Each route still enforces its
  // own auth via a shared x-cron-secret header - see the route files.
  "/api/internal/grants/scan",
  "/api/internal/notifications/check-deadlines",
]);

export const proxy = clerkMiddleware(
  async (auth, req) => {
    const { userId } = await auth();
    const pathname = req.nextUrl.pathname;

    // ---------------------------------------------------------
    // PUBLIC ROUTES
    // ---------------------------------------------------------
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // ---------------------------------------------------------
    // AUTH ENFORCEMENT
    // ---------------------------------------------------------
    if (!userId) {
      return NextResponse.redirect(
        new URL("/sign-in", req.url)
      );
    }

    // ---------------------------------------------------------
// WORKSPACE CREATION BYPASS
// ---------------------------------------------------------
if (pathname === "/api/workspaces/create") {
  return NextResponse.next();
}

// ---------------------------------------------------------
// WORKSPACE API ENFORCEMENT
// ---------------------------------------------------------
if (pathname.startsWith("/api/workspaces/")) {
      const parts = pathname.split("/");
      const workspaceId = parts[3];

      if (!workspaceId) {
        return NextResponse.json(
          {
            error:
              "workspaceId missing in route.",
          },
          {
            status: 400,
          }
        );
      }

      const billing =
        await prisma.workspaceBilling.findFirst({
          where: {
            workspaceId,
          },
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
          {
            error:
              "Billing record not found for workspace.",
          },
          {
            status: 500,
          }
        );
      }

      // ---------------------------------------------------------
      // SEAT LIMITS
      // ---------------------------------------------------------
      const activeMembers =
        await prisma.workspaceMember.count({
          where: {
            workspaceId,
            status: "active",
          },
        });

      if (activeMembers > billing.seats) {
        return NextResponse.json(
          {
            error:
              "Workspace has exceeded its seat limit.",
            seatsAllowed: billing.seats,
            seatsUsed: activeMembers,
          },
          {
            status: 403,
          }
        );
      }

      // ---------------------------------------------------------
      // USER MUST HAVE ACTIVE MEMBERSHIP
      // ---------------------------------------------------------
      const member =
        await prisma.workspaceMember.findFirst({
          where: {
            workspaceId,
            userId,
            status: "active",
          },
          select: {
            id: true,
          },
        });

      if (!member) {
        return NextResponse.json(
          {
            error:
              "You do not have an active seat in this workspace.",
          },
          {
            status: 403,
          }
        );
      }

      // ---------------------------------------------------------
      // AI TOKEN ENFORCEMENT
      // ---------------------------------------------------------
      if (pathname.includes("/ai/")) {
        if (
          billing.aiTokensUsed >=
          billing.aiTokensMonthly
        ) {
          return NextResponse.json(
            {
              error:
                "AI usage limit reached for this billing period.",
              tokensAllowed:
                billing.aiTokensMonthly,
              tokensUsed:
                billing.aiTokensUsed,
            },
            {
              status: 403,
            }
          );
        }
      }

      // ---------------------------------------------------------
      // DOCUMENT LIMITS
      // ---------------------------------------------------------
      if (
        pathname.includes(
          "/documents/create"
        )
      ) {
        const docCount =
          await prisma.workspaceDocument.count({
            where: {
              workspaceId,
            },
          });

        if (
          docCount >= billing.documentLimit
        ) {
          return NextResponse.json(
            {
              error:
                "Document limit reached for your plan.",
              documentsAllowed:
                billing.documentLimit,
              documentsUsed: docCount,
            },
            {
              status: 403,
            }
          );
        }
      }

      // ---------------------------------------------------------
      // STORAGE LIMITS
      // ---------------------------------------------------------
      if (
        pathname.includes("/storage/upload")
      ) {
        const totalStorage =
          await prisma.workspaceDocument.aggregate(
            {
              where: {
                workspaceId,
              },
              _sum: {
                sizeBytes: true,
              },
            }
          );

        const usedMb =
          (totalStorage._sum.sizeBytes || 0) /
          (1024 * 1024);

        if (
          usedMb >=
          billing.storageLimitMb
        ) {
          return NextResponse.json(
            {
              error:
                "Storage limit reached for your plan.",
              storageAllowedMb:
                billing.storageLimitMb,
              storageUsedMb: usedMb,
            },
            {
              status: 403,
            }
          );
        }
      }

      // ---------------------------------------------------------
      // FEATURE GATING
      // ---------------------------------------------------------
      // Basic plan restriction
      if (
        pathname.includes("/ai/improve") &&
        billing.plan === "basic"
      ) {
        return NextResponse.json(
          {
            error:
              "AI Improve is not available on the Basic plan.",
          },
          {
            status: 403,
          }
        );
      }
    }

    return NextResponse.next();
  }
);

// ---------------------------------------------------------
// NEXT.JS 16 PROXY CONFIG
// ---------------------------------------------------------
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",

    "/api/webhooks/(.*)",

    "/api/(.*)",
  ],
};
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "./lib/prisma";
import { WORKSPACE_SCOPE_HEADER } from "./lib/ai/workspaceHeader";
import { checkAiTokenBudget } from "./lib/ai/aiUsage";
import { getWorkspacePlan } from "./lib/workspace/effectivePlan";
import { isAccountLocked, isPathAllowedWhenLocked } from "./lib/billing/trial";

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
  "/integrations(.*)",

  // Free pilot signup page and its submit endpoint - applicants are
  // prospects with no account yet. The API route rate-limits per IP and
  // uses a honeypot field since there's no auth to lean on.
  "/pilot(.*)",
  "/api/pilot",

  // Uptime-monitor target (see app/api/health/route.ts: "unauthenticated on
  // purpose"). Monitors cannot sign in, so without this entry they were
  // redirected to /sign-in and could never see the real status.
  "/api/health",

  // Legal pages - must stay public: besides being publicly accessible by
  // law, Google's OAuth consent screen verification (and any other
  // automated compliance check) fetches these unauthenticated and treats
  // a redirect to /sign-in as "insufficient content" on the policy page.
  "/privacy(.*)",
  "/terms(.*)",
  "/refund(.*)",

  // Crawler/metadata routes - Next.js serves these as real pages at these
  // exact paths (src/app/robots.ts, src/app/sitemap.ts), so without this
  // they hit the same signed-out redirect as everything else, and no
  // search engine can ever fetch them.
  "/robots.txt",
  "/sitemap.xml",

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
  "/api/internal/trial/check",

  // Stripe and Clerk webhooks - sent server-to-server, so there is never a
  // Clerk session on these requests. Without these entries the auth gate
  // below redirected every delivery to /sign-in, so subscription and user
  // sync events were never processed. Each handler verifies the sender's
  // signature itself (Stripe signature / svix headers) and rejects
  // anything unsigned. /api/webhooks/ai-events is deliberately NOT public.
  "/api/webhooks/stripe",
  "/api/webhooks/clerk",

  // Public AI-generated forms - an external respondent (donor, volunteer,
  // grant reviewer) filling one out has no Clerk account. The page and its
  // read/submit API are intentionally unauthenticated; each route only
  // ever looks up a form by its unguessable shareSlug and never exposes
  // workspaceId/grantId/createdById, and submission is rate-limited since
  // there's no auth to fall back on for abuse control.
  "/forms/(.*)",
  "/api/forms/public/(.*)",

  // Server-to-server check from the Nonprofit Management app; protected by
  // its own shared secret (see the route), not a Clerk session.
  "/api/internal/nonprofit-os(.*)",
]);

// ---------------------------------------------------------
// ACCOUNT LOCK (free trial over, not subscribed)
// ---------------------------------------------------------
// See src/lib/billing/trial.ts. A locked account can only reach billing and
// the locked screen. The answer is cached for a short time per account so
// every page and API call does not add a database query; the cost is that
// a customer who has just subscribed may see the lock for up to this long.
const LOCK_CACHE_MS = 30_000;
const lockCache = new Map<string, { locked: boolean; expires: number }>();
const NON_ID_SEGMENTS = new Set(["new", "create", "list"]);

async function isLockedForRequest(userId: string, pathname: string): Promise<boolean> {
  // Inside a workspace the workspace's own account decides (an invited
  // teammate is not locked by the paying owner's workspace); everywhere
  // else it is the signed-in user's own account.
  const m = pathname.match(/^\/(?:api\/workspaces|workspace)\/([^/]+)/);
  const workspaceId = m && !NON_ID_SEGMENTS.has(m[1]) ? m[1] : null;
  const key = workspaceId ? `ws:${workspaceId}` : `user:${userId}`;

  const hit = lockCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.locked;

  const orgSelect = { billingStatus: true, stripeSubscriptionId: true, pilotEndsAt: true } as const;
  let org: { billingStatus: string | null; stripeSubscriptionId: string | null; pilotEndsAt: Date | null } | null | undefined;
  try {
    if (workspaceId) {
      org = (await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { org: { select: orgSelect } } }))?.org;
    } else {
      org = (await prisma.user.findUnique({ where: { id: userId }, select: { Org: { select: orgSelect } } }))?.Org;
    }
  } catch (err) {
    console.error("Account lock check failed, allowing request:", err);
    return false;
  }

  const locked = isAccountLocked(org);
  if (lockCache.size > 5000) lockCache.clear();
  lockCache.set(key, { locked, expires: Date.now() + LOCK_CACHE_MS });
  return locked;
}

export const proxy = clerkMiddleware(
  async (auth, req) => {
    const { userId } = await auth();
    const pathname = req.nextUrl.pathname;

    // Forward the request with our workspace header removed, so a client
    // can never supply it. Workspace routes get it set below, after
    // membership has been verified (see lib/ai/workspaceScope.ts).
    const forwardedHeaders = new Headers(req.headers);
    forwardedHeaders.delete(WORKSPACE_SCOPE_HEADER);
    const passThrough = (verifiedWorkspaceId?: string) => {
      const h = new Headers(forwardedHeaders);
      if (verifiedWorkspaceId) h.set(WORKSPACE_SCOPE_HEADER, verifiedWorkspaceId);
      return NextResponse.next({ request: { headers: h } });
    };
    let verifiedWorkspaceId: string | undefined;

    // ---------------------------------------------------------
    // PUBLIC ROUTES
    // ---------------------------------------------------------
    if (isPublicRoute(req)) {
      return passThrough();
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
    // ACCOUNT LOCK
    // ---------------------------------------------------------
    if (!isPathAllowedWhenLocked(pathname) && (await isLockedForRequest(userId, pathname))) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { error: "Your free trial has ended. Choose a plan to keep using Grant Scout Pro.", code: "ACCOUNT_LOCKED" },
          { status: 402 }
        );
      }
      return NextResponse.redirect(new URL("/locked", req.url));
    }

    // ---------------------------------------------------------
// WORKSPACE CREATION BYPASS
// ---------------------------------------------------------
if (pathname === "/api/workspaces/create") {
  return passThrough();
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

      // ---------------------------------------------------------
      // SOFT-DELETED WORKSPACES
      // ---------------------------------------------------------
      // Owners/admins can delete a workspace (sets deletedAt rather than
      // a hard delete - this app has ~80 relations hanging off Workspace
      // with no cascade rules, so a real delete would either throw on
      // the first FK constraint or, worse, cascade somewhere it
      // shouldn't). Checked here rather than in each of the ~150
      // workspace-scoped routes individually, so every one of them
      // (not just the ones that happen to remember to check) 404s once
      // a workspace is gone.
      const workspaceRecord = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { deletedAt: true },
      });

      if (!workspaceRecord || workspaceRecord.deletedAt) {
        return NextResponse.json(
          { error: "Workspace not found." },
          { status: 404 }
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
        // Uses the same check as the AI model itself: it resolves the
        // workspace's effective plan and rolls the 30-day window over. The
        // previous version compared the raw stored counters here, which
        // never reset, so a workspace that hit its limit stayed blocked
        // forever (the reset only ran inside the AI call this check
        // prevented).
        const budget = await checkAiTokenBudget(workspaceId).catch((err) => {
          console.error("Proxy AI budget check failed:", err);
          return null;
        });
        if (budget && !budget.allowed) {
          return NextResponse.json(
            {
              error: "AI usage limit reached for this billing period.",
              tokensAllowed: budget.limit,
              tokensUsed: budget.used,
              resetsAt: budget.nextResetAt,
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
        (await getWorkspacePlan(workspaceId)).id === "basic"
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

    // Membership in this workspace was verified above.
    verifiedWorkspaceId = pathname.startsWith("/api/workspaces/") ? pathname.split("/")[3] : undefined;
    return passThrough(verifiedWorkspaceId);
  }
);

// ---------------------------------------------------------
// NEXT.JS 16 PROXY CONFIG
// ---------------------------------------------------------
// Static assets (images, fonts, documents, etc.) are served straight out
// of /public or generated by file-convention routes (robots.ts, sitemap.ts,
// icon.tsx). None of those are app pages, so the proxy shouldn't run on
// them at all - without this, every one of them (OG image, favicons,
// brand SVGs, robots.txt, sitemap.xml, PDFs) was falling through to the
// "no userId -> redirect to /sign-in" branch below for signed-out
// requests, which silently broke link previews, favicons, and crawling
// for anyone not logged in.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:png|jpe?g|gif|webp|svg|ico|pdf|mp4|webm|txt|xml|json|webmanifest|css|js|map|woff2?|ttf|otf)$).*)",

    "/api/webhooks/(.*)",

    "/api/(.*)",
  ],
};
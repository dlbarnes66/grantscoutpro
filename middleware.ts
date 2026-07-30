import { NextResponse } from "next/server";
import { authMiddleware } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

// Clerk wrapper — REQUIRED
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  afterAuth: async (auth, req) => {
    const url = req.nextUrl;
    const pathname = url.pathname;
    const userId = auth.userId;

    // Logged-in redirect from marketing homepage → dashboard
    if (userId && pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Public routes allowed without auth
    const publicRoutes = ["/", "/sign-in", "/sign-up"];
    if (!userId && publicRoutes.includes(pathname)) {
      return NextResponse.next();
    }

    // Workspace route detection: /workspace/[workspaceId]/...
    const match = pathname.match(/^\/workspace\/([^\/]+)/);
    if (!match) return NextResponse.next();

    const workspaceId = match[1];

    // Check workspace exists
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        trialLocked: true,
      },
    });

    if (!workspace) {
      return NextResponse.redirect(new URL("/not-found", url));
    }

    // Workspace membership check
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userId || "",
        },
      },
    });

    if (!member) {
      return NextResponse.redirect(new URL("/forbidden", url));
    }

    // Trial lock redirect
    if (workspace.trialLocked) {
      return NextResponse.redirect(
        new URL(`/workspace/${workspaceId}/locked`, url)
      );
    }

    return NextResponse.next();
  },
});

// Matcher — REQUIRED for Clerk
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
    "/api/(.*)",
  ],
};

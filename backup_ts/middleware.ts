import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/sign-in",
    "/sign-up",
    "/api/webhooks(.*)",
  ],

  async afterAuth(auth, req) {
    const url = req.nextUrl;
    const pathname = url.pathname;

    // If user not signed in, allow public routes
    if (!auth.userId) {
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

    // ⭐ Workspace membership check
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: auth.userId,
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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks).*)",
    "/api/(.*)",
  ],
};

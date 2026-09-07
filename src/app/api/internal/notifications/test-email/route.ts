import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { requireUser } from "@/lib/route-guards";
import { sendEmail } from "@/lib/email/sendgrid";
import { workspaceInviteEmail, deadlineReminderEmail, welcomeEmail } from "@/lib/email/templates";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TYPES = ["invite", "deadline", "welcome"] as const;
type EmailType = (typeof VALID_TYPES)[number];

// Lets a super admin send themselves a real copy of any of the three
// transactional emails, so delivery/spam placement can be checked by eye
// before launch instead of just trusting a 200 from SendGrid.
//
// Usage (from the browser, while signed in as a super admin):
//   POST /api/internal/notifications/test-email   { "type": "invite" | "deadline" | "welcome" }
//
// The email always goes to the signed-in user's own address - this is not
// a general-purpose mail relay.
export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!sessionClaims?.superAdmin) {
    return NextResponse.json({ error: "Forbidden: super admin required" }, { status: 403 });
  }

  const me = await requireUser();
  if (!me.email) {
    return NextResponse.json(
      { error: "Your account has no email address on file - can't send a test." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const type = body?.type as EmailType | undefined;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  let payload: { subject: string; html: string; text: string };

  if (type === "invite") {
    payload = workspaceInviteEmail({
      workspaceName: "Test Workspace",
      inviterName: me.name,
      role: "member",
      workspaceId: "test-workspace-id",
    });
  } else if (type === "deadline") {
    payload = deadlineReminderEmail({
      grantTitle: "Community Health Innovation Grant",
      daysLeft: 3,
      workspaceName: "Test Workspace",
      workspaceId: "test-workspace-id",
      grantId: "test-grant-id",
    });
  } else {
    payload = welcomeEmail({ name: me.name });
  }

  payload.subject = `[TEST] ${payload.subject}`;

  try {
    await sendEmail({ to: me.email, ...payload });
    return NextResponse.json({ success: true, sentTo: me.email, type });
  } catch (err: any) {
    console.error("TEST EMAIL SEND ERROR:", err);
    return NextResponse.json({ error: err.message || "Send failed" }, { status: 500 });
  }
}

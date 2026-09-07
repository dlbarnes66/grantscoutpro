import { prisma } from "@/lib/prisma";
import { sendEmailSafe } from "@/lib/email/sendgrid";
import { deadlineReminderEmail } from "@/lib/email/templates";

// Send a reminder when a grant's deadline is this many days away.
const REMINDER_THRESHOLDS = [7, 3, 1];

/**
 * Checks every grant with a deadline and, for the ones landing on one of the
 * REMINDER_THRESHOLDS, emails the workspace owner and active members and
 * logs a WorkspaceNotification.
 *
 * Idempotent: each (grant, daysLeft) pair can only fire once, because we
 * check for an existing WorkspaceNotification with that exact dedupe key
 * before sending. Safe to call more than once a day (e.g. if a cron
 * retries) without spamming anyone.
 */
export async function checkDeadlines() {
  const grants = await prisma.grant.findMany({
    where: { deadline: { not: null } },
    include: {
      workspace: {
        include: {
          owner: true,
          members: { where: { status: "active" }, include: { user: true } },
        },
      },
    },
  });

  const now = Date.now();
  let remindersSent = 0;
  let emailsSent = 0;
  let emailsFailed = 0;

  for (const grant of grants) {
    if (!grant.workspace || !grant.deadline) continue;

    const daysLeft = Math.floor((new Date(grant.deadline).getTime() - now) / 86400000);
    if (!REMINDER_THRESHOLDS.includes(daysLeft)) continue;

    // Dedupe key: unique per grant + threshold, so this only ever fires once
    // for a given grant hitting a given "days left" milestone.
    const dedupeType = `deadline:${grant.id}:${daysLeft}`;

    const alreadySent = await prisma.workspaceNotification.findFirst({
      where: { workspaceId: grant.workspace.id, type: dedupeType },
      select: { id: true },
    });
    if (alreadySent) continue;

    const recipients = new Map<string, { email: string; name: string | null }>();
    if (grant.workspace.owner?.email) {
      recipients.set(grant.workspace.owner.id, {
        email: grant.workspace.owner.email,
        name: grant.workspace.owner.name,
      });
    }
    for (const member of grant.workspace.members) {
      if (member.user?.email) {
        recipients.set(member.user.id, { email: member.user.email, name: member.user.name });
      }
    }

    if (recipients.size === 0) continue;

    // Log the notification first so a slow/failed email send never causes
    // this to be retried and re-sent on the next run.
    await prisma.workspaceNotification.create({
      data: {
        workspaceId: grant.workspace.id,
        userId: grant.workspace.ownerId,
        type: dedupeType,
        message: `"${grant.title}" is due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}.`,
      },
    });
    remindersSent += 1;

    const { subject, html, text } = deadlineReminderEmail({
      grantTitle: grant.title,
      daysLeft,
      workspaceName: grant.workspace.name,
      workspaceId: grant.workspace.id,
      grantId: grant.id,
    });

    for (const recipient of recipients.values()) {
      const result = await sendEmailSafe({ to: recipient.email, subject, html, text });
      if (result.ok) emailsSent += 1;
      else emailsFailed += 1;
    }
  }

  return { success: true, grantsWithReminders: remindersSent, emailsSent, emailsFailed };
}

// src/lib/billing/sendBillingEmailAlert.ts
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email/sendEmail";

export async function sendBillingEmailAlert(
  workspaceId: string,
  subject: string,
  message: string
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      owner: {
        select: { id: true, email: true, name: true },
      },
    },
  });

  if (!workspace?.owner?.email) return;

  const to = workspace.owner.email;

  try {
    await sendEmail({
      to,
      subject,
      text: message,
      category: "billing_alert",
    });

    await prisma.emailLog.create({
      data: {
        provider: "system",
        category: "billing_alert",
        to,
        userId: workspace.owner.id,
        workspaceId,
        payload: { subject, message },
      },
    });
  } catch (err) {
    await prisma.emailLog.create({
      data: {
        provider: "system",
        category: "billing_alert_error",
        to,
        userId: workspace.owner.id,
        workspaceId,
        errorCode: String(err),
      },
    });
  }
}

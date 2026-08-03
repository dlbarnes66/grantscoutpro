import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email/sendEmail";

export async function sendBillingEmailAlert(
  workspaceId: string,
  subject: string,
  message: string
) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { owner: true },
  });

  if (!workspace?.owner?.email) return;

  await sendEmail({
    to: workspace.owner.email,
    subject,
    text: message,
  });
}

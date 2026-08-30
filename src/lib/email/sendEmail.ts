// src/lib/email/sendEmail.ts
import { prisma } from "@/lib/db";

export interface SendEmailParams {
  to: string;
  subject?: string;
  html?: string;
  text?: string;
  category: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject = "", html = "", text = "", category } = params;

  // TODO: integrate real provider (Postmark, SES, etc.)
  // For now we just log to EmailLog.

  await prisma.emailLog.create({
    data: {
      provider: "system",
      category,
      to,
      payload: {
        subject,
        html,
        text,
      },
    },
  });
}

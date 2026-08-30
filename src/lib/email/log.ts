// src/lib/email/log.ts

import { prisma } from "@/lib/db";

export async function logEmailEvent(params: {
  provider: string;
  messageId: string | null;
  category: string;
  to: string;
  workspaceId?: string | null;
  orgId?: string | null;
  userId?: string | null;
  payload?: Record<string, unknown>;
  errorCode?: string | null;
}) {
  await prisma.emailLog.create({
    data: {
      provider: params.provider,
      messageId: params.messageId,
      category: params.category,
      to: params.to,
      workspaceId: params.workspaceId,
      orgId: params.orgId,
      userId: params.userId,
      payload: params.payload ? JSON.stringify(params.payload) : null,
      errorCode: params.errorCode,
    },
  });

  return { success: true };
}

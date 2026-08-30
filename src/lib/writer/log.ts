"use server";

import { prisma } from "@/lib/prisma";

interface WriterUsageLogInput {
  workspaceId: string;
  userId: string | null;
  tool: string;
  documentId: string;
  prompt: string;
  output: string;
}

export async function logWriterUsage(input: WriterUsageLogInput): Promise<void> {
  const { workspaceId, userId, tool, documentId, prompt, output } = input;

  await prisma.workspaceActivity.create({
    data: {
      workspaceId,
      userId,
      action: `writer:${tool}`,
      metadata: {
        documentId,
        prompt,
        output,
        outputLength: output.length
      } satisfies Record<string, unknown>
    }
  });
}

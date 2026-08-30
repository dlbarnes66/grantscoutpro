import { prisma } from "@/lib/prisma";
import { incrementAiUsage } from "@/lib/billing";

/**
 * Run an AI action and log everything:
 * - tokens used
 * - latency
 * - errors
 * - metadata
 * - document association
 * - workspace association
 * - user association
 */
export async function runAiAction({
  workspaceId,
  documentId,
  userId,
  type,
  execute,
  metadata = {},
}) {
  const start = Date.now();

  try {
    // --- EXECUTE AI FUNCTION ---
    const result = await execute();

    const latencyMs = Date.now() - start;
    const tokensUsed = result.tokensUsed || 0;

    // --- BILLING UPDATE ---
    await incrementAiUsage(workspaceId, tokensUsed);

    // --- LOG AI EVENT ---
    await prisma.aiEventLog.create({
      data: {
        workspaceId,
        documentId,
        userId,
        type,
        tokensUsed,
        latencyMs,
        metadata,
      },
    });

    // --- DOCUMENT ACTIVITY LOG ---
    if (documentId) {
      await prisma.workspaceDocumentActivity.create({
        data: {
          workspaceId,
          documentId,
          userId,
          type: `ai:${type}`,
          description: `AI action '${type}' executed.`,
        },
      });
    }

    return {
      ok: true,
      result,
      tokensUsed,
      latencyMs,
    };
  } catch (error: any) {
    const latencyMs = Date.now() - start;

    // --- LOG FAILURE ---
    await prisma.aiEventLog.create({
      data: {
        workspaceId,
        documentId,
        userId,
        type,
        tokensUsed: 0,
        latencyMs,
        error: error.message || "Unknown AI error",
        metadata,
      },
    });

    return {
      ok: false,
      error: error.message || "AI engine error",
    };
  }
}

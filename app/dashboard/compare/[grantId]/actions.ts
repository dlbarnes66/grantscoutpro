"use server";

import { prisma } from "@/lib/prisma";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { pusherServer } from "@/lib/pusher-server";

/* -------------------------------------------------------
   ACTIVITY LOGGING (Stage 3.7F)
------------------------------------------------------- */
async function logActivity(
  comparisonId: string,
  userId: string | null,
  action: string,
  details: any = null
) {
  await prisma.comparisonActivity.create({
    data: {
      comparisonId,
      userId,
      action,
      details,
    },
  });

  // 🔥 Real-time broadcast
  await pusherServer.trigger(`comparison-${comparisonId}`, "updated", {});
}

/* -------------------------------------------------------
   AI ANALYSIS
------------------------------------------------------- */
export async function analyzeComparison(comparisonId: string, userId?: string) {
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) return null;

  const grants = await prisma.federalGrant.findMany({
    where: { id: { in: comparison.grantIds } },
  });

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
You are an expert federal grant analyst. Compare the following grants and determine:

1. Which grant is the best fit overall.
2. A short explanation why.
3. Strengths and weaknesses for each grant.
4. A 3–5 sentence summary nonprofits can understand.

Return JSON ONLY in this format:

{
  "winnerId": "id",
  "winnerReason": "text",
  "summary": "text",
  "grants": [
    {
      "id": "id",
      "strengths": ["a", "b"],
      "weaknesses": ["a", "b"]
    }
  ]
}

GRANTS:
${JSON.stringify(grants, null, 2)}
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const json = JSON.parse(response.choices[0].message.content);

  await prisma.grantComparison.update({
    where: { id: comparisonId },
    data: { analysis: json },
  });

  await logActivity(comparisonId, userId ?? null, "analysis_run", null);

  revalidatePath(`/dashboard/compare/${comparisonId}`);
  return json;
}

/* -------------------------------------------------------
   RENAME COMPARISON
------------------------------------------------------- */
export async function renameComparison(id: string, name: string, userId?: string) {
  await prisma.grantComparison.update({
    where: { id },
    data: { name },
  });

  await logActivity(id, userId ?? null, "rename", { name });

  revalidatePath(`/dashboard/compare/${id}`);
}

/* -------------------------------------------------------
   ADD GRANT TO COMPARISON
------------------------------------------------------- */
export async function addGrantToComparison(
  comparisonId: string,
  grantId: string,
  userId?: string
) {
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) return;
  if (comparison.grantIds.includes(grantId)) return;

  await prisma.grantComparison.update({
    where: { id: comparisonId },
    data: {
      grantIds: [...comparison.grantIds, grantId],
      analysis: null,
    },
  });

  await logActivity(comparisonId, userId ?? null, "grant_added", { grantId });

  revalidatePath(`/dashboard/compare/${comparisonId}`);
}

/* -------------------------------------------------------
   REMOVE GRANT FROM COMPARISON
------------------------------------------------------- */
export async function removeGrantFromComparison(
  comparisonId: string,
  grantId: string,
  userId?: string
) {
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) return;

  const updated = comparison.grantIds.filter((id) => id !== grantId);

  await prisma.grantComparison.update({
    where: { id: comparisonId },
    data: {
      grantIds: updated,
      analysis: null,
    },
  });

  await logActivity(comparisonId, userId ?? null, "grant_removed", { grantId });

  revalidatePath(`/dashboard/compare/${comparisonId}`);
}

/* -------------------------------------------------------
   SHARE COMPARISON WITH TEAM
------------------------------------------------------- */
export async function shareComparison(
  comparisonId: string,
  email: string,
  userId?: string
) {
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) return;

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) return;
  if (comparison.sharedWith.includes(normalized)) return;

  await prisma.grantComparison.update({
    where: { id: comparisonId },
    data: {
      sharedWith: [...comparison.sharedWith, normalized],
    },
  });

  await logActivity(comparisonId, userId ?? null, "shared_with", { email });

  revalidatePath(`/dashboard/compare/${comparisonId}`);
}

/* -------------------------------------------------------
   REMOVE SHARED USER
------------------------------------------------------- */
export async function removeSharedUser(
  comparisonId: string,
  email: string,
  userId?: string
) {
  const comparison = await prisma.grantComparison.findUnique({
    where: { id: comparisonId },
  });

  if (!comparison) return;

  const updated = comparison.sharedWith.filter(
    (e) => e.toLowerCase() !== email.toLowerCase()
  );

  await prisma.grantComparison.update({
    where: { id: comparisonId },
    data: {
      sharedWith: updated,
    },
  });

  await logActivity(comparisonId, userId ?? null, "share_removed", { email });

  revalidatePath(`/dashboard/compare/${comparisonId}`);
}

/* -------------------------------------------------------
   DELETE COMPARISON
------------------------------------------------------- */
export async function deleteComparison(id: string, userId?: string) {
  await logActivity(id, userId ?? null, "deleted", null);

  await prisma.grantComparison.delete({
    where: { id },
  });

  revalidatePath(`/dashboard/compare`);
}

/* -------------------------------------------------------
   ADD COMMENT (Stage 3.9)
------------------------------------------------------- */
export async function addComment(
  comparisonId: string,
  text: string,
  userId: string
) {
  if (!text.trim()) return;

  await prisma.comparisonComment.create({
    data: {
      comparisonId,
      userId,
      text,
    },
  });

  await logActivity(comparisonId, userId, "comment_added", { text });

  revalidatePath(`/dashboard/compare/${comparisonId}`);
}

/* -------------------------------------------------------
   DELETE COMMENT (Stage 3.9)
------------------------------------------------------- */
export async function deleteComment(
  commentId: string,
  comparisonId: string,
  userId: string
) {
  const comment = await prisma.comparisonComment.findUnique({
    where: { id: commentId },
  });

  if (!comment) return;
  if (comment.userId !== userId) return;

  await prisma.comparisonComment.delete({
    where: { id: commentId },
  });

  await logActivity(comparisonId, userId, "comment_deleted", { commentId });

  revalidatePath(`/dashboard/compare/${comparisonId}`);
}

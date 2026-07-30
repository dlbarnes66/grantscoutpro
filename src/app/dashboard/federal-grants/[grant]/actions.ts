"use server";

export async function handleGenerateSummary(grantId: string) {
  console.log("Generating summary for grant:", grantId);
  return { ok: true, summary: "Summary generated successfully." };
}

export async function handleGenerateScores(grantId: string) {
  console.log("Generating scores for grant:", grantId);
  return { ok: true, scores: { score: 92 } };
}

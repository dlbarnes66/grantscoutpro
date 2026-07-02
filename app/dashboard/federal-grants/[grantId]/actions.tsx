"use server";

import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export async function generateAISummary(grantId: string) {
  const grant = await prisma.federalGrant.findUnique({
    where: { id: grantId },
  });

  if (!grant) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
Summarize this federal grant in 3–5 sentences for a nonprofit audience.
Highlight eligibility, purpose, funding amount, and deadline.

Title: ${grant.title}
Summary: ${grant.summary}
Agency: ${grant.agency}
Category: ${grant.category}
Amount: ${grant.amount}
Deadline: ${grant.deadline}
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const aiSummary = response.choices[0].message.content;

  await prisma.federalGrant.update({
    where: { id: grantId },
    data: { summary: aiSummary },
  });

  return aiSummary;
}

export async function generateGrantScores(grantId: string, profile: any) {
  const grant = await prisma.federalGrant.findUnique({
    where: { id: grantId },
  });

  if (!grant) return null;

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const prompt = `
Evaluate this grant for a nonprofit based on the following profile:

PROFILE:
${JSON.stringify(profile, null, 2)}

GRANT:
${JSON.stringify(grant, null, 2)}

Return a JSON object with:
- eligibilityScore (0–100)
- fitScore (0–100)
- riskScore (0–100)
- explanation (short text)
  `;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const json = JSON.parse(response.choices[0].message.content);

  await prisma.federalGrant.update({
    where: { id: grantId },
    data: {
      raw: {
        ...grant.raw,
        aiScores: json,
      },
    },
  });

  return json;
}

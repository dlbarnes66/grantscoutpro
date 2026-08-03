import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MatchResult {
  grant: unknown;
  score: number;
  explanation: string;
}

export async function matchGrants(
  project: unknown,
  grants: unknown[]
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];

  for (const grant of grants) {
    const prompt = `
You are an expert grant reviewer. Score how well this project matches the grant.

Project:
${JSON.stringify(project, null, 2)}

Grant:
${JSON.stringify(grant, null, 2)}

Return a JSON object with:
- score (0-100)
- explanation (2-3 sentences)
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    let parsed: { score: number; explanation: string };

    try {
      parsed = JSON.parse(completion.choices[0].message.content ?? "{}");
    } catch {
      parsed = { score: 0, explanation: "AI parsing error." };
    }

    results.push({
      grant,
      score: parsed.score,
      explanation: parsed.explanation,
    });
  }

  return rankResults(results);
}

function rankResults(results: MatchResult[]): MatchResult[] {
  return results.sort((a, b) => b.score - a.score);
}

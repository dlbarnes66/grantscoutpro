import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateNarrative(
  section: string,
  project: unknown,
  tone: string
): Promise<string> {
  const prompt = `
You are an expert grant writer. Write the "${section}" section for the following project.

Project:
${JSON.stringify(project, null, 2)}

Tone: ${tone}

Requirements:
- 3–5 paragraphs
- Clear, professional language
- Align with common federal grant compliance standards
- No filler
- No generic statements
- Must be specific to the project

Return ONLY the narrative text.
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return completion.choices[0].message.content ?? "";
}

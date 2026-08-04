import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || ""
});

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
});

export function extractClaudeJSON(response: any) {
  const block = response.content?.find(
    (c: any) => c.type === "text" || c.type === "output_text"
  );

  try {
    return JSON.parse(block?.text || "{}");
  } catch {
    return {};
  }
}

export async function callClaudeJSON(prompt: string) {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    temperature: 0.2,
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: prompt }]
      }
    ]
  });

  return extractClaudeJSON(response);
}

export async function callOpenAIJSON(prompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.2,
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }]
  });

  const text = response.choices[0]?.message?.content || "";

  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// You will replace these with your actual API clients
import Groq from "groq-sdk";
import Anthropic from "@anthropic-ai/sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  const { url, html, text } = await req.json();

  // STEP 1 — Fetch page if URL provided
  let rawContent = text || html;
  if (!rawContent && url) {
    const res = await fetch(url);
    rawContent = await res.text();
  }

  if (!rawContent) {
    return NextResponse.json({ error: "No content provided" }, { status: 400 });
  }

  // STEP 2 — Preprocess with Groq (cheap + fast)
  const groqResponse = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
You are a preprocessing engine. Clean the HTML, remove boilerplate, extract the main grant content, and return ONLY the cleaned text.`
      },
      {
        role: "user",
        content: rawContent
      }
    ],
    temperature: 0.1,
  });

  const cleanedText = groqResponse.choices[0].message.content;

  // STEP 3 — Deep extraction with Claude
  const claudeResponse = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20240620",
    max_tokens: 2000,
    temperature: 0.1,
    system: `
You are an elite grant extraction engine. 
Extract structured data from messy government text.
Return ONLY valid JSON matching this schema:

{
  "title": "string",
  "summary": "string",
  "amount": "string or null",
  "deadline": "string or null",
  "category": "string or null",
  "agency": "string or null",
  "url": "string or null",
  "eligibility": "string or null",
  "score": number,
  "content": "string"
}
`,
    messages: [
      {
        role: "user",
        content: cleanedText
      }
    ]
  });

  const json = JSON.parse(claudeResponse.content[0].text);

  // STEP 4 — Save to database
  const saved = await prisma.grantPreview.create({
    data: {
      title: json.title,
      summary: json.summary,
      amount: json.amount,
      deadline: json.deadline,
      category: json.category,
      agency: json.agency,
      url: json.url || url,
      score: json.score,
      content: json.content,
    }
  });

  return NextResponse.json({ grant: saved });
}

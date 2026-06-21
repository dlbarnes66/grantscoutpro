import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const { query } = await req.json();

  // Search Grants.gov
  const grantsGov = await fetch(
    `https://www.grants.gov/search-grants?keywords=${encodeURIComponent(query)}`
  ).then((r) => r.text());

  // Search SAM.gov
  const samGov = await fetch(
    `https://sam.gov/search/?keywords=${encodeURIComponent(query)}`
  ).then((r) => r.text());

  // Combine HTML
  const combined = `
    <GRANTS_GOV>${grantsGov}</GRANTS_GOV>
    <SAM_GOV>${samGov}</SAM_GOV>
  `;

  // Use Groq to extract URLs
  const groqResponse = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      {
        role: "system",
        content: `
Extract all grant opportunity URLs from the HTML.
Return ONLY a JSON array of URLs.
Example:
["https://www.grants.gov/view-opportunity.html?oppId=12345"]
`
      },
      {
        role: "user",
        content: combined
      }
    ],
    temperature: 0.1,
  });

  const urls = JSON.parse(groqResponse.choices[0].message.content);

  return NextResponse.json({ urls });
}

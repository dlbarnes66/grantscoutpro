import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request, { params }) {
  try {
    const documentId = params.id;

    // Fetch full document content
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { content: true },
    });

    if (!doc || !doc.content) {
      return NextResponse.json(
        { error: "Document not found or has no content" },
        { status: 404 }
      );
    }

    const fullText =
      typeof doc.content === "string"
        ? doc.content
        : JSON.stringify(doc.content);

    // Ask AI to extract eligibility rules
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You extract grant eligibility requirements. Return ONLY valid JSON with fields: eligibleApplicants, ineligibleApplicants, geographicRestrictions, fundingRestrictions, requiredStatus, requiredExperience, requiredDocuments, summary.",
        },
        {
          role: "user",
          content: fullText,
        },
      ],
      response_format: { type: "json_object" },
    });

    const eligibility = response.choices[0].message.content;

    return NextResponse.json(JSON.parse(eligibility));
  } catch (error) {
    console.error("Eligibility extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract eligibility" },
      { status: 500 }
    );
  }
}

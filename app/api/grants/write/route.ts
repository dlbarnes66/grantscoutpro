import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Mode = "proposal" | "loi" | "narrative" | "budget" | "questions";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { grantId, mode, questions, section } = body as {
    grantId: string;
    mode: Mode;
    questions?: string[];
    section?: string;
  };

  if (!grantId || !mode) {
    return NextResponse.json({ error: "Missing grantId or mode" }, { status: 400 });
  }

  const grant = await prisma.grantPreview.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const orgContext = profile
    ? `
Organization Name: ${profile.organizationName || "N/A"}
Mission: ${profile.mission || "N/A"}
Focus Areas: ${(profile.focusAreas || []).join(", ") || "N/A"}
Populations Served: ${(profile.populationsServed || []).join(", ") || "N/A"}
Geographic Service: ${(profile.geographicService || []).join(", ") || "N/A"}
Annual Budget: ${profile.annualBudget || "N/A"}
Staff Size: ${profile.staffSize || "N/A"}
Grant Experience: ${profile.grantExperience || "N/A"}
Strategic Goals: ${profile.strategicGoals || "N/A"}
`
    : "No organization profile available. Write for a generic nonprofit.";

  const grantContext = `
Grant Title: ${grant.title}
Summary: ${grant.summary}
Amount: ${grant.amount || "N/A"}
Deadline: ${grant.deadline || "N/A"}
Category: ${grant.category || "N/A"}
Agency: ${grant.agency || "N/A"}
`;

  // ---------------------------
  // SECTION-LEVEL INSTRUCTIONS
  // ---------------------------
  let instruction = "";

  if (section) {
    instruction = `
Regenerate ONLY the following section of the ${mode}:
"${section}"

Do NOT rewrite the entire document.
Do NOT include unrelated sections.
Produce ONLY the rewritten section text.
`;
  } else {
    switch (mode) {
      case "proposal":
        instruction = `
Write a full grant proposal including:
- Problem statement
- Project description
- Goals and objectives
- Methods
- Evaluation plan
- Budget justification
- Organizational capacity
- Sustainability
`;
        break;

      case "loi":
        instruction = `
Write a 1–2 page Letter of Inquiry (LOI).
`;
        break;

      case "narrative":
        instruction = `
Write the narrative section of a grant proposal.
`;
        break;

      case "budget":
        instruction = `
Write a detailed budget justification.
`;
        break;

      case "questions":
        instruction = `
Answer the following grant questions:
${(questions || []).map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;
        break;
    }
  }

  const prompt = `
You are an expert grant writer.

Grant Context:
${grantContext}

Organization Context:
${orgContext}

Task:
${instruction}
`;

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const draft = response.choices[0].message.content;

  return NextResponse.json({ draft });
}

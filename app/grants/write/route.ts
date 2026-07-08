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
  const { grantId, mode, questions } = body as {
    grantId: string;
    mode: Mode;
    questions?: string[];
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
    : "No organization profile is available. Write for a generic nonprofit.";

  const baseGrantContext = `
Grant Title: ${grant.title}
Summary: ${grant.summary}
Amount: ${grant.amount || "N/A"}
Deadline: ${grant.deadline || "N/A"}
Category: ${grant.category || "N/A"}
Agency: ${grant.agency || "N/A"}
`;

  let instruction = "";

  switch (mode) {
    case "proposal":
      instruction = `
Write a full grant proposal for this organization applying to this grant.
Include:
- Problem statement / needs assessment
- Project description
- Goals and objectives
- Methods / activities
- Evaluation plan
- Budget justification
- Organizational capacity
- Sustainability

Write in clear, professional, persuasive language.
`;
      break;

    case "loi":
      instruction = `
Write a 1–2 page Letter of Inquiry (LOI) for this organization applying to this grant.
Include:
- Brief introduction to the organization
- Summary of the project
- Need being addressed
- Expected outcomes
- High-level budget
- Closing and contact.
`;
      break;

    case "narrative":
      instruction = `
Write the narrative section of a grant proposal for this organization applying to this grant.
Focus on:
- Story of the community need
- How the project responds
- Impact on beneficiaries
- Why this organization is well-positioned.
`;
      break;

    case "budget":
      instruction = `
Write a detailed budget justification for this organization applying to this grant.
Explain:
- How funds will be used
- Why each cost is necessary
- How the budget aligns with outcomes.
`;
      break;

    case "questions":
      instruction = `
Answer the following grant application questions for this organization applying to this grant.
Provide clear, complete, persuasive answers.

Questions:
${(questions || []).map((q, i) => `${i + 1}. ${q}`).join("\n")}
`;
      break;
  }

  const prompt = `
You are an expert grant writer for nonprofits.

Grant Context:
${baseGrantContext}

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

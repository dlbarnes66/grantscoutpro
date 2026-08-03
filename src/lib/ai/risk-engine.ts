import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * 128B — AI Risk Engine
 * Generates the core risk report using AI.
 */
export async function generateRiskReport(project: any, grant: any) {
  const prompt = `
You are a federal grant compliance expert. Analyze the project against the grant requirements.

Project:
${JSON.stringify(project, null, 2)}

Grant:
${JSON.stringify(grant, null, 2)}

Return a JSON object with:
- risk_score (0-100)
- compliance_issues: list of issues
- recommendations: list of fixes
- summary: 2–3 sentence overview
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  return JSON.parse(completion.choices[0].message.content);
}

/**
 * 128C — Compliance Rule Evaluator
 * Adds deterministic rule-based compliance checks.
 */
export function evaluateCompliance(project: any, grant: any) {
  const issues: string[] = [];

  // Geographic eligibility mismatch
  if (project.location !== grant.location) {
    issues.push("Project location does not match grant geographic eligibility.");
  }

  // Population mismatch
  if (!project.population?.includes(grant.population)) {
    issues.push("Target population does not fully align with grant requirements.");
  }

  // Budget sanity check (example rule)
  if (project.budget && project.budget < 5000) {
    issues.push("Project budget appears too low for typical federal grant expectations.");
  }

  return issues;
}

/**
 * 128D — Full Risk Analysis Wrapper
 * Combines AI risk report + rule-based compliance issues.
 */
export async function fullRiskAnalysis(project: any, grant: any) {
  const aiReport = await generateRiskReport(project, grant);
  const ruleIssues = evaluateCompliance(project, grant);

  return {
    ...aiReport,
    compliance_issues: [...aiReport.compliance_issues, ...ruleIssues]
  };
}

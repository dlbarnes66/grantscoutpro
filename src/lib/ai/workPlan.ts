// Work Plan & Timeline: a structured, editable template (not AI-written).
//
// The package stores the plan as data next to the narrative sections
// ({ sections, workPlan } in Application.content) and keeps the
// "Work Plan & Timeline" section's text in sync with it via
// renderWorkPlanText, so the PDF, the plain-text narrative, the review and
// the bundle all read ordinary section text and need no special handling.
//
// Pure functions only (no server imports) - the editor in the browser and
// the API routes share this file.

export type WorkPlanRow = {
  id: string;
  phase: string;
  activity: string;
  owner: string;
  startMonth: number; // 1-based, within the project period
  endMonth: number;
  milestone: string;
};

export type WorkPlan = {
  startDate: string | null; // YYYY-MM-DD
  durationMonths: number;
  rows: WorkPlanRow[];
  notes: string;
};

export const WORK_PLAN_TITLE = "Work Plan & Timeline";
export const MIN_MONTHS = 1;
export const MAX_MONTHS = 60;

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

function row(id: string, phase: string, activity: string, owner: string, start: number, end: number, milestone: string, months: number): WorkPlanRow {
  const s = clamp(Math.round(start), 1, months);
  const e = clamp(Math.round(end), s, months);
  return { id, phase, activity, owner, startMonth: s, endMonth: e, milestone };
}

/**
 * A generic grant project timeline scaled to the project length. Roles are
 * generic job functions, not invented people, and every cell is editable.
 */
export function buildWorkPlanTemplate(durationMonths = 12, startDate: string | null = null): WorkPlan {
  const n = clamp(Math.round(durationMonths) || 12, MIN_MONTHS, MAX_MONTHS);
  const half = Math.max(1, Math.ceil(n / 2));
  const rows: WorkPlanRow[] = [
    row("wp1", "Project startup", "Confirm staffing and partner agreements, set up data tracking and reporting systems, hold a kickoff meeting.", "Project Director", 1, Math.min(2, n), "Staff and agreements in place; baseline measures recorded", n),
    row("wp2", "Outreach and enrollment", "Launch outreach to the target population and enroll participants, customers or sites.", "Program Manager", Math.min(2, n), Math.min(4, n), "Enrollment target for the first cohort reached", n),
    row("wp3", "Program delivery, first half", "Deliver the core program activities and services described in the Program Description.", "Program Staff", Math.min(3, n), half, "First-half service and participation targets met", n),
    row("wp4", "Mid-point review", "Review progress against each objective, adjust the plan where needed, and submit an interim report if the funder requires one.", "Project Director with Evaluator", half, half, "Mid-point progress report completed", n),
    row("wp5", "Program delivery, second half", "Continue and complete service delivery; document outcomes and participant results.", "Program Staff", Math.min(half + 1, n), Math.max(n - 2, 1), "All planned services delivered", n),
    row("wp6", "Evaluation", "Collect final outcome data, analyze results against the performance indicators, and draft findings.", "Evaluator", Math.max(n - 2, 1), n, "Evaluation findings completed", n),
    row("wp7", "Reporting and closeout", "Submit final programmatic and financial reports and complete grant closeout.", "Grants / Finance Manager", Math.max(n - 1, 1), n, "Final reports submitted on time", n),
    row("wp8", "Sustainability handoff", "Secure follow-on funding and partner commitments so the work continues after the grant.", "Executive Director", Math.max(n - 2, 1), n, "Sustainability actions underway", n),
  ];
  return { startDate, durationMonths: n, rows, notes: "" };
}

function isIsoDate(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}

/** Validates and normalizes a plan from the browser. Returns null if unusable. */
export function sanitizeWorkPlan(input: unknown): WorkPlan | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, any>;
  const months = clamp(Math.round(Number(raw.durationMonths)) || 12, MIN_MONTHS, MAX_MONTHS);
  const rowsIn: any[] = Array.isArray(raw.rows) ? raw.rows.slice(0, 40) : [];
  const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const rows: WorkPlanRow[] = rowsIn
    .filter((r) => r && typeof r === "object")
    .map((r, i) => {
      const s = clamp(Math.round(Number(r.startMonth)) || 1, 1, months);
      const e = clamp(Math.round(Number(r.endMonth)) || s, s, months);
      return {
        id: text(r.id, 40) || `wp${i + 1}`,
        phase: text(r.phase, 120),
        activity: text(r.activity, 800),
        owner: text(r.owner, 120),
        startMonth: s,
        endMonth: e,
        milestone: text(r.milestone, 300),
      };
    });
  return {
    startDate: isIsoDate(raw.startDate) ? raw.startDate : null,
    durationMonths: months,
    rows,
    notes: text(raw.notes, 3000),
  };
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "Mar 2027" for project month `m` (1-based) given a start date, else null. */
export function monthLabel(startDate: string | null, m: number): string | null {
  if (!isIsoDate(startDate)) return null;
  const [y, mo] = startDate.split("-").map(Number);
  const idx = mo - 1 + (m - 1);
  return `${MONTH_NAMES[((idx % 12) + 12) % 12]} ${y + Math.floor(idx / 12)}`;
}

function periodLabel(plan: WorkPlan, start: number, end: number): string {
  const months = start === end ? `Month ${start}` : `Months ${start}-${end}`;
  const a = monthLabel(plan.startDate, start);
  const b = monthLabel(plan.startDate, end);
  if (!a || !b) return months;
  return `${months} (${a === b ? a : `${a} to ${b}`})`;
}

/** Project start and end dates for SF-424 item 17 (end = last day of the final month). */
export function projectDates(plan: WorkPlan | null): { start: Date | null; end: Date | null } {
  if (!plan || !isIsoDate(plan.startDate)) return { start: null, end: null };
  const [y, m, d] = plan.startDate.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(Date.UTC(y, m - 1 + plan.durationMonths, 0));
  return { start, end };
}

export function formatUsDate(d: Date | null): string | null {
  if (!d) return null;
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getUTCFullYear()}`;
}

/** Plain-text rendering used as the section content. */
export function renderWorkPlanText(plan: WorkPlan): string {
  const lines: string[] = [];
  const startLabel = monthLabel(plan.startDate, 1);
  lines.push(`Project period: ${plan.durationMonths} month${plan.durationMonths === 1 ? "" : "s"}${startLabel ? `, starting ${startLabel}` : ""}.`);
  lines.push("");
  plan.rows.forEach((r, i) => {
    lines.push(`Phase ${i + 1}: ${r.phase || "Untitled phase"} - ${periodLabel(plan, r.startMonth, r.endMonth)}`);
    if (r.activity) lines.push(`Activities: ${r.activity}`);
    if (r.owner) lines.push(`Responsible: ${r.owner}`);
    if (r.milestone) lines.push(`Milestone: ${r.milestone}`);
    lines.push("");
  });
  if (plan.notes.trim()) {
    lines.push(plan.notes.trim());
    lines.push("");
  }
  return lines.join("\n").trim();
}

import { StandardFonts, rgb, type PDFDocument, type PDFFont, type PDFPage } from "pdf-lib";

// Faithful, code-generated recreations of the SF-424 federal form family
// (SF-424, SF-424A, SF-424B - OMB 4040-0004 / 4040-0006 / 4040-0007),
// auto-filled from Grant Scout Pro's own data. These are NOT the actual
// government PDF files - those are dynamic Adobe XFA forms (no standard
// AcroForm fields), which pdf-lib (or any non-Adobe tool) cannot fill
// programmatically, and grants.gov submission happens through its own
// online Workspace rather than an uploaded third-party PDF anyway. The
// original blank reference forms are kept in public/forms/federal/ for
// the user to view side-by-side. This module instead draws the same
// boxes, labels and standard assurance text directly - same approach as
// generatePackagePdf/generateDocumentPdf in generatePdf.ts - so the
// output is complete, accurate, and still clearly labeled as drawn from
// Grant Scout Pro rather than a forged copy of the federal file.

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const NOTE_GRAY = rgb(0.55, 0.55, 0.58);
const INK = rgb(0.1, 0.1, 0.1);
const HEAD_INK = rgb(0.05, 0.1, 0.2);
const RULE = rgb(0.75, 0.75, 0.78);

function wrapLine(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  if (!text || text.trim().length === 0) return [""];
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export type Sf424Profile = {
  organizationName: string | null;
  organizationType: string | null;
  ein: string | null;
  uei: string | null;
  streetAddress: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  county: string | null;
  country: string | null;
  orgPhone: string | null;
  congressionalDistrictApplicant: string | null;
  congressionalDistrictProject: string | null;
  authorizedRepName: string | null;
  authorizedRepTitle: string | null;
  authorizedRepPhone: string | null;
  authorizedRepEmail: string | null;
  geographicService: string[] | null;
};

export type Sf424Grant = {
  title: string;
  agency: string | null;
  category: string | null;
  summary: string | null;
  awardFloor: number | null;
  awardCeiling: number | null;
  opportunityNumber?: string | null;
  cfdaNumber?: string | null;
  raw?: unknown;
};

export type Sf424BudgetLineItem = { category: string; description: string; amount: number };

const RAW_OPPORTUNITY_KEYS = [
  "opportunityNumber",
  "OPPORTUNITY_NUMBER",
  "fundingOpportunityNumber",
  "FundingOpportunityNumber",
];
const RAW_CFDA_KEYS = [
  "cfdaNumber",
  "cfdaNumbers",
  "CFDA_NUMBERS",
  "assistanceListingNumber",
  "assistanceListingNumbers",
  "alnNumber",
];

function readRawKey(raw: unknown, keys: string[]): string | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (Array.isArray(value) && value.length && typeof value[0] === "string") return value[0];
  }
  return null;
}

/** Grant.opportunityNumber if persisted, else best-effort from the raw ingestion payload. */
export function extractOpportunityNumber(grant: Sf424Grant): string | null {
  return grant.opportunityNumber?.trim() || readRawKey(grant.raw, RAW_OPPORTUNITY_KEYS);
}

/** Grant.cfdaNumber if persisted, else best-effort from the raw ingestion payload. */
export function extractCfdaNumber(grant: Sf424Grant): string | null {
  return grant.cfdaNumber?.trim() || readRawKey(grant.raw, RAW_CFDA_KEYS);
}

const ORG_TYPE_CODES: Record<string, string> = {
  Nonprofit: "M: Nonprofit with 501(c)(3) IRS Status (Other than Institution of Higher Education)",
  "School District": "H: Independent School District",
  "College / University": "O: Private Institution of Higher Education",
  Municipality: "C: City or Township Government",
  "Tribal Government": "I: Indian/Native American Tribal Government (Federally Recognized)",
  "For-Profit": "P: Individual",
};

export type Sf424ABuckets = {
  personnel: number;
  fringe: number;
  travel: number;
  equipment: number;
  supplies: number;
  contractual: number;
  construction: number;
  other: number;
  indirect: number;
  totalDirect: number;
  total: number;
};

/**
 * Buckets Grant Scout Pro's free-text budget line items into the fixed
 * SF-424A Section B object-class categories by keyword match. Anything
 * unmatched falls into "Other" (6h) rather than being silently dropped,
 * so the bucketed total always reconciles with the original budget total.
 */
export function bucketBudgetForSf424A(lineItems: Sf424BudgetLineItem[]): Sf424ABuckets {
  const b: Sf424ABuckets = {
    personnel: 0,
    fringe: 0,
    travel: 0,
    equipment: 0,
    supplies: 0,
    contractual: 0,
    construction: 0,
    other: 0,
    indirect: 0,
    totalDirect: 0,
    total: 0,
  };
  for (const item of lineItems || []) {
    const label = `${item.category || ""} ${item.description || ""}`.toLowerCase();
    const amount = Number(item.amount) || 0;
    if (/indirect|overhead/.test(label)) b.indirect += amount;
    else if (/personnel|salary|salaries|wage|staff(?!ing supplies)/.test(label)) b.personnel += amount;
    else if (/fringe|benefit/.test(label)) b.fringe += amount;
    else if (/travel|mileage|lodging|airfare/.test(label)) b.travel += amount;
    else if (/equipment/.test(label)) b.equipment += amount;
    else if (/supplies|material/.test(label)) b.supplies += amount;
    else if (/contract|consultant|subcontract|subaward/.test(label)) b.contractual += amount;
    else if (/construction/.test(label)) b.construction += amount;
    else b.other += amount;
  }
  b.totalDirect =
    b.personnel + b.fringe + b.travel + b.equipment + b.supplies + b.contractual + b.construction + b.other;
  b.total = b.totalDirect + b.indirect;
  return b;
}

function money(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "$0";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function addressLines(p: Sf424Profile): string[] {
  const line1 = p.streetAddress || "";
  const line2 = p.addressLine2 || "";
  const cityStateZip = [p.city, p.state].filter(Boolean).join(", ") + (p.zipCode ? ` ${p.zipCode}` : "");
  const countyCountry = [p.county ? `${p.county} County` : "", p.country].filter(Boolean).join(" · ");
  return [line1, line2, cityStateZip.trim(), countyCountry].filter((l) => l && l.trim().length > 0);
}

function fallback(v: string | null | undefined, placeholder = "Not provided"): string {
  return v && v.trim().length > 0 ? v.trim() : placeholder;
}

// ---------- shared page chrome ----------

function newFormPage(pdf: PDFDocument, boldFont: PDFFont, formCode: string, formTitle: string, ombNo: string) {
  const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;
  page.drawText(formCode, { x: MARGIN, y, size: 15, font: boldFont, color: HEAD_INK });
  page.drawText(`OMB No. ${ombNo}`, {
    x: PAGE_WIDTH - MARGIN - boldFont.widthOfTextAtSize(`OMB No. ${ombNo}`, 8),
    y: y + 3,
    size: 8,
    font: boldFont,
    color: NOTE_GRAY,
  });
  y -= 20;
  page.drawText(formTitle, { x: MARGIN, y, size: 11, font: boldFont, color: HEAD_INK });
  y -= 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 1, color: RULE });
  y -= 14;
  return { page, y };
}

function footer(page: PDFPage, font: PDFFont, label: string) {
  page.drawText(`${label} - verify all entries before submission`, {
    x: MARGIN,
    y: MARGIN / 2,
    size: 7.5,
    font,
    color: NOTE_GRAY,
  });
}

type RowCtx = { page: PDFPage; y: number; font: PDFFont; boldFont: PDFFont };

function box(ctx: RowCtx, label: string, value: string, opts: { width?: number; x?: number; placeholder?: boolean } = {}) {
  const width = opts.width ?? CONTENT_WIDTH;
  const x = opts.x ?? MARGIN;
  ctx.page.drawText(label, { x, y: ctx.y, size: 7.5, font: ctx.boldFont, color: NOTE_GRAY });
  const lines = wrapLine(value, ctx.font, 9.5, width);
  let ly = ctx.y - 10;
  for (const line of lines) {
    ctx.page.drawText(line, {
      x,
      y: ly,
      size: 9.5,
      font: ctx.font,
      color: opts.placeholder ? NOTE_GRAY : INK,
    });
    ly -= 11.5;
  }
  return ly;
}

// ---------- SF-424 ----------

export function addSf424Page(
  pdf: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont,
  profile: Sf424Profile,
  grant: Sf424Grant,
  requestedAmount: number
) {
  const { page, y: y0 } = newFormPage(
    pdf,
    boldFont,
    "SF-424",
    "Application for Federal Assistance",
    "4040-0004"
  );
  let y = y0;
  const ctx: RowCtx = { page, y, font, boldFont };
  const col1 = MARGIN;
  const col2 = MARGIN + CONTENT_WIDTH / 2 + 8;
  const colW = CONTENT_WIDTH / 2 - 8;

  ctx.y = y;
  let leftY = box(ctx, "1. TYPE OF SUBMISSION", "Application", { x: col1, width: colW });
  let rightY = box(ctx, "2. TYPE OF APPLICATION", "New", { x: col2, width: colW });
  y = Math.min(leftY, rightY) - 6;

  ctx.y = y;
  leftY = box(ctx, "3. DATE RECEIVED BY STATE / FEDERAL AGENCY", "To be completed by agency", {
    x: col1,
    width: colW,
    placeholder: true,
  });
  rightY = box(ctx, "5b. FEDERAL AWARD IDENTIFIER", "Not yet assigned (pre-award)", {
    x: col2,
    width: colW,
    placeholder: true,
  });
  y = Math.min(leftY, rightY) - 10;

  page.drawText("8. APPLICANT INFORMATION", { x: col1, y, size: 9, font: boldFont, color: HEAD_INK });
  y -= 13;
  ctx.y = y;
  y = box(ctx, "a. Legal Name", fallback(profile.organizationName), { width: CONTENT_WIDTH }) - 4;

  ctx.y = y;
  leftY = box(ctx, "b. Employer/Taxpayer ID (EIN/TIN)", fallback(profile.ein), { x: col1, width: colW });
  rightY = box(ctx, "c. UEI", fallback(profile.uei), { x: col2, width: colW });
  y = Math.min(leftY, rightY) - 4;

  const addr = addressLines(profile);
  ctx.y = y;
  y = box(ctx, "d. Address", addr.length ? addr.join("\n") : "Not provided", { width: CONTENT_WIDTH }) - 4;

  ctx.y = y;
  const contact = [profile.authorizedRepName, profile.authorizedRepTitle].filter(Boolean).join(", ");
  const contactLine =
    [contact, profile.authorizedRepPhone, profile.authorizedRepEmail].filter(Boolean).join("  ·  ") ||
    "Not provided";
  y = box(ctx, "f. Name and contact information of person to be contacted", contactLine, {
    width: CONTENT_WIDTH,
    placeholder: !contact,
  }) - 10;

  ctx.y = y;
  leftY = box(ctx, "9. TYPE OF APPLICANT", ORG_TYPE_CODES[profile.organizationType || ""] || fallback(profile.organizationType), {
    x: col1,
    width: colW,
  });
  rightY = box(ctx, "10. NAME OF FEDERAL AGENCY", fallback(grant.agency), { x: col2, width: colW });
  y = Math.min(leftY, rightY) - 6;

  ctx.y = y;
  leftY = box(
    ctx,
    "11. CATALOG OF FEDERAL DOMESTIC ASSISTANCE NUMBER / ASSISTANCE LISTING",
    fallback(extractCfdaNumber(grant)),
    { x: col1, width: colW, placeholder: !extractCfdaNumber(grant) }
  );
  rightY = box(
    ctx,
    "12. FUNDING OPPORTUNITY NUMBER / TITLE",
    `${fallback(extractOpportunityNumber(grant), "Not on file")}${grant.title ? ` - ${grant.title}` : ""}`,
    { x: col2, width: colW, placeholder: !extractOpportunityNumber(grant) }
  );
  y = Math.min(leftY, rightY) - 6;

  ctx.y = y;
  y = box(ctx, "15. DESCRIPTIVE TITLE OF APPLICANT'S PROJECT", fallback(grant.title), { width: CONTENT_WIDTH }) - 6;

  ctx.y = y;
  leftY = box(ctx, "16a. CONGRESSIONAL DISTRICT OF APPLICANT", fallback(profile.congressionalDistrictApplicant), {
    x: col1,
    width: colW,
    placeholder: !profile.congressionalDistrictApplicant,
  });
  rightY = box(
    ctx,
    "16b. CONGRESSIONAL DISTRICT OF PROGRAM/PROJECT",
    fallback(profile.congressionalDistrictProject || profile.congressionalDistrictApplicant),
    { x: col2, width: colW, placeholder: !profile.congressionalDistrictProject && !profile.congressionalDistrictApplicant }
  );
  y = Math.min(leftY, rightY) - 6;

  ctx.y = y;
  leftY = box(ctx, "17. PROPOSED PROJECT START / END DATE", "To be completed before submission", {
    x: col1,
    width: colW,
    placeholder: true,
  });
  rightY = box(ctx, "18a. ESTIMATED FUNDING - FEDERAL ($)", money(requestedAmount), { x: col2, width: colW });
  y = Math.min(leftY, rightY) - 10;

  page.drawText("19. IS APPLICATION SUBJECT TO REVIEW BY STATE EXECUTIVE ORDER 12372 PROCESS?", {
    x: col1,
    y,
    size: 7.5,
    font: boldFont,
    color: NOTE_GRAY,
  });
  y -= 11;
  page.drawText("20. IS THE APPLICANT DELINQUENT ON ANY FEDERAL DEBT?", {
    x: col1,
    y,
    size: 7.5,
    font: boldFont,
    color: NOTE_GRAY,
  });
  page.drawText("To be confirmed before submission (both items)", {
    x: col1,
    y: y - 11.5,
    size: 9.5,
    font,
    color: NOTE_GRAY,
  });
  y -= 30;

  page.drawText("21. AUTHORIZED REPRESENTATIVE", { x: col1, y, size: 9, font: boldFont, color: HEAD_INK });
  y -= 13;
  ctx.y = y;
  leftY = box(ctx, "Name / Title", `${fallback(profile.authorizedRepName)} / ${fallback(profile.authorizedRepTitle, "")}`.replace(/ \/ $/, ""), {
    x: col1,
    width: colW,
    placeholder: !profile.authorizedRepName,
  });
  rightY = box(
    ctx,
    "Phone / Email",
    [profile.authorizedRepPhone, profile.authorizedRepEmail].filter(Boolean).join(" / ") || "Not provided",
    { x: col2, width: colW, placeholder: !profile.authorizedRepPhone && !profile.authorizedRepEmail }
  );
  y = Math.min(leftY, rightY) - 10;

  page.drawLine({ start: { x: col1, y }, end: { x: col1 + colW, y }, thickness: 0.75, color: RULE });
  page.drawText("Signature of Authorized Representative", { x: col1, y: y - 9, size: 7.5, font, color: NOTE_GRAY });
  page.drawLine({ start: { x: col2, y }, end: { x: col2 + colW, y }, thickness: 0.75, color: RULE });
  page.drawText("Date Signed", { x: col2, y: y - 9, size: 7.5, font, color: NOTE_GRAY });

  footer(page, font, "SF-424 (auto-populated draft)");
}

// ---------- SF-424A ----------

const SF424A_ROWS: [string, keyof Sf424ABuckets][] = [
  ["a. Personnel", "personnel"],
  ["b. Fringe Benefits", "fringe"],
  ["c. Travel", "travel"],
  ["d. Equipment", "equipment"],
  ["e. Supplies", "supplies"],
  ["f. Contractual", "contractual"],
  ["g. Construction", "construction"],
  ["h. Other", "other"],
];

export function addSf424APage(
  pdf: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont,
  grant: Sf424Grant,
  buckets: Sf424ABuckets,
  notes: string
) {
  const { page, y: y0 } = newFormPage(
    pdf,
    boldFont,
    "SF-424A",
    "Budget Information - Non-Construction Programs",
    "4040-0006"
  );
  let y = y0;

  page.drawText("SECTION A - BUDGET SUMMARY", { x: MARGIN, y, size: 9.5, font: boldFont, color: HEAD_INK });
  y -= 16;

  const headers = ["Grant Program / Function", "CFDA No.", "Federal ($)", "Total ($)"];
  const colX = [MARGIN, MARGIN + 260, MARGIN + 340, MARGIN + 440];
  headers.forEach((h, i) =>
    page.drawText(h, { x: colX[i], y, size: 8, font: boldFont, color: NOTE_GRAY })
  );
  y -= 12;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: RULE });
  y -= 12;

  const cfda = extractCfdaNumber(grant) || "Not on file";
  const row = [grant.title || "Untitled program", cfda, money(buckets.total), money(buckets.total)];
  row.forEach((cell, i) => {
    const lines = wrapLine(cell, font, 9, i === 0 ? 250 : 90);
    lines.slice(0, 2).forEach((l, li) =>
      page.drawText(l, { x: colX[i], y: y - li * 11, size: 9, font, color: INK })
    );
  });
  y -= 26;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: RULE });
  y -= 12;
  page.drawText("Totals", { x: colX[0], y, size: 9, font: boldFont, color: HEAD_INK });
  page.drawText(money(buckets.total), { x: colX[2], y, size: 9, font: boldFont, color: HEAD_INK });
  page.drawText(money(buckets.total), { x: colX[3], y, size: 9, font: boldFont, color: HEAD_INK });
  y -= 26;

  page.drawText("SECTION B - BUDGET CATEGORIES (Object Class)", {
    x: MARGIN,
    y,
    size: 9.5,
    font: boldFont,
    color: HEAD_INK,
  });
  y -= 16;
  page.drawText("6. Object Class Category", { x: MARGIN, y, size: 8, font: boldFont, color: NOTE_GRAY });
  page.drawText("Total ($)", { x: MARGIN + 440, y, size: 8, font: boldFont, color: NOTE_GRAY });
  y -= 10;
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: RULE });
  y -= 13;

  for (const [label, key] of SF424A_ROWS) {
    page.drawText(label, { x: MARGIN, y, size: 9, font, color: INK });
    page.drawText(money(buckets[key]), { x: MARGIN + 440, y, size: 9, font, color: INK });
    y -= 13;
  }
  page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_WIDTH - MARGIN, y }, thickness: 0.75, color: RULE });
  y -= 13;
  page.drawText("i. Total Direct Charges", { x: MARGIN, y, size: 9, font: boldFont, color: HEAD_INK });
  page.drawText(money(buckets.totalDirect), { x: MARGIN + 440, y, size: 9, font: boldFont, color: HEAD_INK });
  y -= 13;
  page.drawText("j. Indirect Charges", { x: MARGIN, y, size: 9, font, color: INK });
  page.drawText(money(buckets.indirect), { x: MARGIN + 440, y, size: 9, font, color: INK });
  y -= 13;
  page.drawText("k. TOTALS (i + j)", { x: MARGIN, y, size: 9, font: boldFont, color: HEAD_INK });
  page.drawText(money(buckets.total), { x: MARGIN + 440, y, size: 9, font: boldFont, color: HEAD_INK });
  y -= 24;

  page.drawText(
    "Sections C (Non-Federal Resources), D (Forecasted Cash Needs) and E (Budget Estimates - Future Years)",
    { x: MARGIN, y, size: 8.5, font, color: NOTE_GRAY }
  );
  y -= 11;
  page.drawText(
    "are not populated here - Grant Scout Pro does not currently collect cost-share or multi-year figures.",
    { x: MARGIN, y, size: 8.5, font, color: NOTE_GRAY }
  );
  y -= 20;

  page.drawText("SECTION F - OTHER BUDGET INFORMATION / REMARKS", {
    x: MARGIN,
    y,
    size: 9.5,
    font: boldFont,
    color: HEAD_INK,
  });
  y -= 14;
  const remarkLines = wrapLine(notes || "No additional remarks on file.", font, 9, CONTENT_WIDTH);
  for (const line of remarkLines) {
    page.drawText(line, { x: MARGIN, y, size: 9, font, color: !notes ? NOTE_GRAY : INK });
    y -= 11.5;
  }

  footer(page, font, "SF-424A (auto-populated draft)");
}

// ---------- SF-424B ----------

const SF424B_ASSURANCES = [
  "1. Has the legal authority to apply for Federal assistance and the institutional, managerial and financial capability to ensure proper planning, management and completion of the project.",
  "2. Will give the awarding agency the right to inspect all records related to the project, and will establish a proper accounting system in accordance with generally accepted accounting standards or agency directives.",
  "3. Will establish safeguards to prohibit employees from using their positions for a purpose that constitutes or presents the appearance of personal or organizational conflict of interest.",
  "4. Will initiate and complete the work within the applicable time frame after receipt of approval of the awarding agency.",
  "5. Will comply with the Intergovernmental Personnel Act of 1970 regarding merit systems for programs funded under one of its nineteen statutes or regulations specified in Appendix A of OPM's Standards for a Merit System of Personnel Administration.",
  "6. Will comply with all Federal statutes relating to nondiscrimination, including but not limited to Title VI of the Civil Rights Act of 1964, Title IX of the Education Amendments of 1972, Section 504 of the Rehabilitation Act of 1973, the Age Discrimination Act of 1975, and the Drug Abuse Office and Treatment Act of 1972.",
  "7. Will comply with the Americans with Disabilities Act of 1990, as applicable.",
  "8. Will comply with the provisions of the Hatch Act, which limits the political activity of employees whose principal employment activities are funded in whole or in part with Federal funds.",
  "9. Will comply with the Davis-Bacon Act, the Copeland Act and the Contract Work Hours and Safety Standards Act regarding labor standards for federally assisted construction subagreements, where applicable.",
  "10. Will comply with flood insurance purchase requirements of the Flood Disaster Protection Act of 1973 if the project is located in a flood hazard area.",
  "11. Will comply with environmental standards, including the National Environmental Policy Act, the Clean Air Act, the Clean Water Act, and the Endangered Species Act, as applicable.",
  "12. Will comply with the Wild and Scenic Rivers Act related to protecting components of the national wild and scenic rivers system.",
  "13. Will assist the awarding agency in assuring compliance with Section 106 of the National Historic Preservation Act of 1966, as amended.",
  "14. Will comply with the Lead-Based Paint Poisoning Prevention Act regarding the prohibition of lead-based paint in construction or rehabilitation of residential structures.",
  "15. Will comply with the Laboratory Animal Welfare Act, as applicable, regarding the care, handling and treatment of warm-blooded animals in research, teaching or testing.",
  "16. Will comply with the Federal Water Pollution Control Act and the Safe Drinking Water Act, as applicable.",
  "17. Will comply with the Coastal Zone Management Act, as applicable.",
  "18. Will comply with all applicable requirements of all other Federal laws, executive orders, regulations and policies governing this program.",
];

export function addSf424BPage(
  pdf: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont,
  profile: Sf424Profile
) {
  const { page: firstPage, y: y0 } = newFormPage(
    pdf,
    boldFont,
    "SF-424B",
    "Assurances - Non-Construction Programs",
    "4040-0007"
  );
  let page = firstPage;
  let y = y0;

  page.drawText(
    "As the duly authorized representative of the applicant, the applicant certifies that it:",
    { x: MARGIN, y, size: 9, font, color: INK }
  );
  y -= 18;

  for (const item of SF424B_ASSURANCES) {
    const lines = wrapLine(item, font, 8.5, CONTENT_WIDTH);
    const needed = lines.length * 10.5 + 4;
    if (y - needed < MARGIN + 90) {
      footer(page, font, "SF-424B (auto-populated draft)");
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    for (const line of lines) {
      page.drawText(line, { x: MARGIN, y, size: 8.5, font, color: INK });
      y -= 10.5;
    }
    y -= 4;
  }

  y -= 10;
  if (y < MARGIN + 90) {
    footer(page, font, "SF-424B (auto-populated draft)");
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  page.drawText("AS THE DULY AUTHORIZED REPRESENTATIVE OF THE APPLICANT", {
    x: MARGIN,
    y,
    size: 9,
    font: boldFont,
    color: HEAD_INK,
  });
  y -= 18;

  const col1 = MARGIN;
  const col2 = MARGIN + CONTENT_WIDTH / 2 + 8;
  const colW = CONTENT_WIDTH / 2 - 8;
  const ctx: RowCtx = { page, y, font, boldFont };
  let leftY = box(ctx, "APPLICANT ORGANIZATION", fallback(profile.organizationName), { x: col1, width: colW });
  let rightY = box(
    ctx,
    "TYPED NAME AND TITLE",
    `${fallback(profile.authorizedRepName)}${profile.authorizedRepTitle ? `, ${profile.authorizedRepTitle}` : ""}`,
    { x: col2, width: colW, placeholder: !profile.authorizedRepName }
  );
  y = Math.min(leftY, rightY) - 16;

  page.drawLine({ start: { x: col1, y }, end: { x: col1 + colW, y }, thickness: 0.75, color: RULE });
  page.drawText("SIGNATURE", { x: col1, y: y - 9, size: 7.5, font, color: NOTE_GRAY });
  page.drawLine({ start: { x: col2, y }, end: { x: col2 + colW, y }, thickness: 0.75, color: RULE });
  page.drawText("DATE SUBMITTED", { x: col2, y: y - 9, size: 7.5, font, color: NOTE_GRAY });

  footer(page, font, "SF-424B (auto-populated draft)");
}

export { StandardFonts };

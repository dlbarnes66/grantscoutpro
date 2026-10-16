// One validated, whitelisted path for writing UserProfile from a request
// body. Used by both the workspace Grant Profile settings route and the
// user-level onboarding save route, so the two can never drift apart on
// which fields are writable or how they are checked. Previously the
// onboarding route passed the raw request body straight into prisma.
//
// Only keys present in the body are touched, so partial saves are safe.

const STRING_FIELDS = [
  "organizationName",
  "legalName",
  "mission",
  "website",
  "linkedin",
  "facebook",
  "instagram",
  "country",
  "state",
  "city",
  "streetAddress",
  "addressLine2",
  "zipCode",
  "county",
  "orgPhone",
  "congressionalDistrictApplicant",
  "congressionalDistrictProject",
  "authorizedRepName",
  "authorizedRepTitle",
  "authorizedRepPhone",
  "authorizedRepEmail",
  "nonprofitStatus",
  "ein",
  "uei",
  "budgetRange",
  "serviceScope",
  "grantExperience",
  "pastGrants",
  "strategicGoals",
  "priorityAreas",
] as const;

const INT_FIELDS = ["staffSize", "annualBudget", "pastWins", "pastLosses"] as const;
const STRING_ARRAY_FIELDS = ["focusAreas", "populationsServed", "geographicService"] as const;

export const MAX_ADDITIONAL_WEBSITES = 4;

/** Returns a clean https URL, or null when the text is not a usable web address. */
export function normalizeWebsiteUrl(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (!/^https?:$/.test(url.protocol)) return null;
    if (!url.hostname.includes(".") || url.hostname.length > 253) return null;
    return url.toString().replace(/\/$/, "").slice(0, 300);
  } catch {
    return null;
  }
}

export type ProfilePatchResult = { data: Record<string, any> } | { error: string };

export function sanitizeProfilePatch(
  body: unknown,
  opts: { allowOrganizationType?: boolean } = {}
): ProfilePatchResult {
  if (!body || typeof body !== "object") return { error: "Invalid request body" };
  const input = body as Record<string, any>;
  const data: Record<string, any> = {};

  const stringFields: string[] = [...STRING_FIELDS];
  if (opts.allowOrganizationType) stringFields.push("organizationType");

  for (const field of stringFields) {
    if (!(field in input)) continue;
    const value = input[field];
    if (value === null) {
      data[field] = null;
    } else if (typeof value === "string") {
      const trimmed = value.trim().slice(0, 5000);
      data[field] = trimmed.length ? trimmed : null;
    } else {
      return { error: `${field} must be a string` };
    }
  }

  // Format checks on the identifiers that end up on federal forms. A wrong
  // EIN or UEI on an SF-424 gets an application rejected, so catch typos
  // here instead of at submission.
  if (data.ein) {
    const digits = String(data.ein).replace(/\D/g, "");
    if (digits.length !== 9) return { error: "EIN must be 9 digits, for example 12-3456789." };
    data.ein = `${digits.slice(0, 2)}-${digits.slice(2)}`;
  }
  if (data.uei) {
    const uei = String(data.uei).replace(/\s/g, "").toUpperCase();
    if (!/^[A-Z0-9]{12}$/.test(uei)) return { error: "UEI must be 12 letters and numbers (from your SAM.gov registration)." };
    data.uei = uei;
  }
  if (data.zipCode && !/^\d{5}(-\d{4})?$/.test(String(data.zipCode))) {
    return { error: "ZIP code must be 5 digits, or 9 digits like 36601-1234." };
  }
  if (data.authorizedRepEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.authorizedRepEmail))) {
    return { error: "The authorized representative's email doesn't look right." };
  }

  for (const field of INT_FIELDS) {
    if (!(field in input)) continue;
    const value = input[field];
    if (value === null || value === "") {
      data[field] = null;
    } else {
      const n = Number(value);
      if (!Number.isFinite(n)) return { error: `${field} must be a number` };
      data[field] = Math.trunc(n);
    }
  }

  for (const field of STRING_ARRAY_FIELDS) {
    if (!(field in input)) continue;
    const value = input[field];
    if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
      return { error: `${field} must be an array of strings` };
    }
    data[field] = value.map((v: string) => v.trim().slice(0, 200)).filter(Boolean).slice(0, 50);
  }

  if ("websites" in input) {
    const value = input.websites;
    if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
      return { error: "websites must be an array of strings" };
    }
    const cleaned: string[] = [];
    for (const raw of value as string[]) {
      if (!raw.trim()) continue;
      const url = normalizeWebsiteUrl(raw);
      if (!url) return { error: `"${raw.trim().slice(0, 60)}" doesn't look like a website address.` };
      if (!cleaned.includes(url)) cleaned.push(url);
    }
    if (cleaned.length > MAX_ADDITIONAL_WEBSITES) {
      return { error: `You can add up to ${MAX_ADDITIONAL_WEBSITES} additional websites.` };
    }
    data.websites = cleaned;
  }

  if ("eo12372Status" in input) {
    const v = input.eo12372Status;
    if (v === null || v === "") data.eo12372Status = null;
    else if (v === "a" || v === "b" || v === "c") data.eo12372Status = v;
    else return { error: "eo12372Status must be a, b or c" };
  }

  if ("federalDebtDelinquent" in input) {
    const v = input.federalDebtDelinquent;
    if (v === null || v === "") data.federalDebtDelinquent = null;
    else if (typeof v === "boolean") data.federalDebtDelinquent = v;
    else return { error: "federalDebtDelinquent must be true, false or empty" };
  }

  return { data };
}

/** The full profile shape sent to the browser (used by both profile GET routes). */
export function serializeProfileForClient(
  profile: Record<string, any> | null,
  organizationType: string
) {
  const p = profile ?? {};
  const str = (k: string) => (typeof p[k] === "string" ? p[k] : "");
  const num = (k: string) => (typeof p[k] === "number" ? p[k] : null);
  const arr = (k: string) => (Array.isArray(p[k]) ? (p[k] as string[]) : []);
  return {
    organizationName: str("organizationName"),
    legalName: str("legalName"),
    organizationType,
    mission: str("mission"),
    website: str("website"),
    websites: arr("websites"),

    linkedin: str("linkedin"),
    facebook: str("facebook"),
    instagram: str("instagram"),

    country: str("country"),
    state: str("state"),
    city: str("city"),
    streetAddress: str("streetAddress"),
    addressLine2: str("addressLine2"),
    zipCode: str("zipCode"),
    county: str("county"),
    orgPhone: str("orgPhone"),
    congressionalDistrictApplicant: str("congressionalDistrictApplicant"),
    congressionalDistrictProject: str("congressionalDistrictProject"),
    authorizedRepName: str("authorizedRepName"),
    authorizedRepTitle: str("authorizedRepTitle"),
    authorizedRepPhone: str("authorizedRepPhone"),
    authorizedRepEmail: str("authorizedRepEmail"),

    nonprofitStatus: str("nonprofitStatus"),
    ein: str("ein"),
    uei: str("uei"),
    eo12372Status: str("eo12372Status"),
    federalDebtDelinquent: typeof p.federalDebtDelinquent === "boolean" ? p.federalDebtDelinquent : null,

    staffSize: num("staffSize"),
    annualBudget: num("annualBudget"),
    budgetRange: str("budgetRange"),
    grantExperience: str("grantExperience"),

    focusAreas: arr("focusAreas"),
    populationsServed: arr("populationsServed"),
    geographicService: arr("geographicService"),
    serviceScope: str("serviceScope"),

    pastGrants: str("pastGrants"),
    pastWins: num("pastWins"),
    pastLosses: num("pastLosses"),

    strategicGoals: str("strategicGoals"),
    priorityAreas: str("priorityAreas"),
  };
}

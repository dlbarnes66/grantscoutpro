"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { US_STATES } from "@/lib/location/states";

function Tooltip({
  text,
}: {
  text: string;
}) {
  return (
    <span
      title={text}
      className="cursor-help rounded-full bg-slate-700 px-2 py-1 text-xs font-semibold text-cyan-300"
    >
      ?
    </span>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  tooltip,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  tooltip?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-slate-300">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-lg p-3 text-black"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

const TOTAL_STEPS = 7;

// Same rules the server enforces (src/lib/profile/profilePatch.ts), checked
// here first so one typo doesn't cost the whole step's answers.
function checkFormats(v: { ein: string; uei: string; zipCode: string; repEmail: string }): string | null {
  if (v.ein.trim() && v.ein.replace(/\D/g, "").length !== 9) return "EIN must be 9 digits, for example 12-3456789.";
  if (v.uei.trim() && !/^[A-Za-z0-9]{12}$/.test(v.uei.replace(/\s/g, ""))) return "UEI must be 12 letters and numbers (from your SAM.gov registration).";
  if (v.zipCode.trim() && !/^\d{5}(-\d{4})?$/.test(v.zipCode.trim())) return "ZIP code must be 5 digits, or 9 digits like 36601-1234.";
  if (v.repEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.repEmail.trim())) return "The authorized representative's email doesn't look right.";
  return null;
}

export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");

  const [profile, setProfile] = useState<any>(null);

  const [organizationType, setOrganizationType] =
    useState("Nonprofit");

  const [budgetRange, setBudgetRange] =
    useState("Under $100K");

  const [fundingPriorities, setFundingPriorities] =
    useState("");

  const [grantGoals, setGrantGoals] =
    useState("");

    const [ein, setEin] = useState("");
const [uei, setUei] = useState("");

const [primaryState, setPrimaryState] =
  useState("");

const [serviceScope, setServiceScope] =
  useState("County");

const [populationsServed, setPopulationsServed] =
  useState("");

const [programAreas, setProgramAreas] =
  useState("");

  // Additional websites (optional, up to 4 beyond the main one).
  const [websites, setWebsites] = useState<string[]>([]);

  // Federal application details (SF-424 family).
  const [legalName, setLegalName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [county, setCounty] = useState("");
  const [orgPhone, setOrgPhone] = useState("");
  const [districtApplicant, setDistrictApplicant] = useState("");
  const [districtProject, setDistrictProject] = useState("");
  const [repName, setRepName] = useState("");
  const [repTitle, setRepTitle] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [eo12372, setEo12372] = useState("");
  const [federalDebt, setFederalDebt] = useState("");

  const [hasSavedProfile, setHasSavedProfile] = useState(false);
  const [skippedSites, setSkippedSites] = useState<string[]>([]);

  // Reopening onboarding later (to review or update the organization's
  // details) starts from what was saved instead of a blank form.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/settings/profile");
        if (!res.ok) return;
        const data = await res.json();
        const p = data?.profile;
        if (!data?.exists || !p?.organizationName) return;
        setHasSavedProfile(true);
        setProfile({ organizationName: p.organizationName, mission: p.mission, website: p.website, keywords: p.focusAreas });
        setWebsite(p.website || "");
        setWebsites(Array.isArray(p.websites) ? p.websites : []);
        setLinkedin(p.linkedin || "");
        setFacebook(p.facebook || "");
        setInstagram(p.instagram || "");
        if (p.organizationType) setOrganizationType(p.organizationType);
        if (p.budgetRange) setBudgetRange(p.budgetRange);
        setFundingPriorities(p.priorityAreas || "");
        setGrantGoals(p.strategicGoals || "");
        setEin(p.ein || "");
        setUei(p.uei || "");
        setPrimaryState(p.state || "");
        if (p.serviceScope) setServiceScope(p.serviceScope);
        setPopulationsServed((p.populationsServed || []).join(", "));
        setLegalName(p.legalName || "");
        setStreetAddress(p.streetAddress || "");
        setAddressLine2(p.addressLine2 || "");
        setCity(p.city || "");
        setZipCode(p.zipCode || "");
        setCounty(p.county || "");
        setOrgPhone(p.orgPhone || "");
        setDistrictApplicant(p.congressionalDistrictApplicant || "");
        setDistrictProject(p.congressionalDistrictProject || "");
        setRepName(p.authorizedRepName || "");
        setRepTitle(p.authorizedRepTitle || "");
        setRepPhone(p.authorizedRepPhone || "");
        setRepEmail(p.authorizedRepEmail || "");
        setEo12372(p.eo12372Status || "");
        setFederalDebt(p.federalDebtDelinquent === null || p.federalDebtDelinquent === undefined ? "" : p.federalDebtDelinquent ? "yes" : "no");
      } catch {
        /* first-time users have nothing to load */
      }
    })();
  }, []);

  const stepTitles: Record<number, string> = {
    1: "Organization Discovery",
    2: "Profile Review",
    3: "Funding Profile",
    4: "Federal Application Details",
    5: "Grant Goals",
    6: "Workspace Setup",
    7: "Launch Workspace",
  };

  async function analyzeOrganization() {
    try {
      setLoading(true);

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          website,
          websites: websites.filter((w) => w.trim()),
          linkedin,
          facebook,
          instagram,
        }),
      });

      const data = await response.json();

      setProfile(data);
      setSkippedSites(Array.isArray(data?.skippedSites) ? data.skippedSites : []);

      console.log(
        "Onboarding Response:",
        data
      );

      setStep(2);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Steps 3 and 4 gather most of what onboarding is actually for, but
  // until now none of it (besides organizationName/mission/website/
  // focusAreas from the step-1 site scrape) ever reached the database -
  // it lived in this component's state and was thrown away the moment
  // someone clicked through to /home. This persists everything via the
  // same profile-upsert endpoint Settings uses, so nothing typed here is
  // lost even if the user never opens Settings afterward.
  async function saveProfile() {
    setSavingProfile(true);
    setSaveError(null);
    try {
      const existingKeywords: string[] = Array.isArray(profile?.keywords) ? profile.keywords : [];
      const programAreaList = programAreas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const mergedFocusAreas = Array.from(new Set([...existingKeywords, ...programAreaList]));

      const populationsServedList = populationsServed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/settings/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            organizationType,
            budgetRange,
            priorityAreas: fundingPriorities,
            strategicGoals: grantGoals,
            ein,
            uei,
            state: primaryState,
            serviceScope,
            populationsServed: populationsServedList,
            legalName,
            websites: websites.filter((w) => w.trim()),
            streetAddress,
            addressLine2,
            city,
            zipCode,
            county,
            orgPhone,
            congressionalDistrictApplicant: districtApplicant,
            congressionalDistrictProject: districtProject,
            authorizedRepName: repName,
            authorizedRepTitle: repTitle,
            authorizedRepPhone: repPhone,
            authorizedRepEmail: repEmail,
            eo12372Status: eo12372,
            federalDebtDelinquent: federalDebt === "" ? null : federalDebt === "yes",
            ...(mergedFocusAreas.length ? { focusAreas: mergedFocusAreas } : {}),
          },
        }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json?.error || "Failed to save your profile");
      }
    } catch (error: any) {
      console.error("Onboarding profile save failed:", error);
      // Best-effort: don't trap someone in onboarding over a save hiccup,
      // but let them know so they can double check Settings afterward.
      setSaveError(
        `${error?.message || "Some of your answers couldn't be saved just now"} - you can add or fix them anytime from Workspace Settings > Grant Profile.`
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function nextStep() {
    if (step === 3 || step === 4) {
      const problem = checkFormats({ ein, uei, zipCode, repEmail });
      if (problem) {
        setSaveError(problem);
        return;
      }
    }
    setSaveError(null);
    if (step === 5) {
      await saveProfile();
    }
    setStep((prev) =>
      Math.min(prev + 1, TOTAL_STEPS)
    );
  }

  function previousStep() {
    setSaveError(null);
    setStep((prev) =>
      Math.max(prev - 1, 1)
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          GrantScout Pro Onboarding
        </h1>

        <p className="mt-2 text-slate-400">
          Step {step} of {TOTAL_STEPS} •{" "}
          {stepTitles[step]}
        </p>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Getting Started</span>
            <span>
              {Math.round(
                (step / TOTAL_STEPS) * 100
              )}
              % Complete
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{
                width: `${
                  (step / TOTAL_STEPS) * 100
                }%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(
              (number) => (
                <div
                  key={number}
                  className={`h-2 rounded-full ${
                    step >= number
                      ? "bg-cyan-500"
                      : "bg-slate-700"
                  }`}
                />
              )
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-[#11233F] p-8 shadow-xl">

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              Organization Discovery
            </h2>

            <div>
              <label className="mb-2 flex items-center gap-2 text-slate-300">
                Organization Website *
                <Tooltip text="GrantScout analyzes your website to identify programs, initiatives, service areas and grant opportunities." />
              </label>

              <input
                type="text"
                placeholder="https://yourorganization.org"
                className="w-full rounded-lg p-3 text-black"
                value={website}
                onChange={(e) =>
                  setWebsite(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-slate-300">
                Additional Websites (optional)
                <Tooltip text="Have a separate site for a program, campaign or chapter? Add up to 4 more and we'll read them all when building your profile." />
              </label>

              <div className="space-y-2">
                {websites.map((w, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://yourprogram.org"
                      className="w-full rounded-lg p-3 text-black"
                      value={w}
                      onChange={(e) =>
                        setWebsites((prev) =>
                          prev.map((x, j) => (j === i ? e.target.value : x))
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setWebsites((prev) => prev.filter((_, j) => j !== i))
                      }
                      className="rounded-lg bg-slate-700 px-4 text-slate-200"
                      aria-label="Remove website"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {websites.length < 4 && (
                <button
                  type="button"
                  onClick={() => setWebsites((prev) => [...prev, ""])}
                  className="mt-2 text-sm text-cyan-300 hover:underline"
                >
                  + Add another website
                </button>
              )}
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-slate-300">
                LinkedIn Company URL
                <Tooltip text="LinkedIn helps enrich information about leadership, programs and organizational priorities." />
              </label>

              <input
                type="text"
                placeholder="https://linkedin.com/company/your-org"
                className="w-full rounded-lg p-3 text-black"
                value={linkedin}
                onChange={(e) =>
                  setLinkedin(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-slate-300">
                Facebook URL
              </label>

              <input
                type="text"
                placeholder="https://facebook.com/your-org"
                className="w-full rounded-lg p-3 text-black"
                value={facebook}
                onChange={(e) =>
                  setFacebook(
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-slate-300">
                Instagram URL
              </label>

              <input
                type="text"
                placeholder="https://instagram.com/your-org"
                className="w-full rounded-lg p-3 text-black"
                value={instagram}
                onChange={(e) =>
                  setInstagram(
                    e.target.value
                  )
                }
              />
            </div>

            {hasSavedProfile && (
              <div className="rounded-xl border border-cyan-800 bg-cyan-950/30 p-4 text-sm text-slate-300">
                You already have a saved organization profile. Edit anything
                below and re-scan, or keep your saved details and go straight
                to updating them.
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="mt-3 block rounded-lg bg-slate-700 px-4 py-2 text-white"
                >
                  Use saved profile (skip website scan)
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              Review Organization Profile
            </h2>

            <div className="rounded-xl bg-slate-800 p-6">
              <p>
                <strong>
                  Organization:
                </strong>{" "}
                {
                  profile?.organizationName
                }
              </p>

              <p className="mt-3">
                <strong>
                  Mission:
                </strong>{" "}
                {profile?.mission}
              </p>

              <p className="mt-3">
                <strong>
                  Website:
                </strong>{" "}
                {profile?.website}
              </p>

              <p className="mt-3">
                <strong>
                  Keywords:
                </strong>{" "}
                {profile?.keywords?.join(
                  ", "
                )}
              </p>
            </div>

            {skippedSites.length > 0 && (
              <p className="text-sm text-amber-400">
                We couldn&apos;t read: {skippedSites.join(", ")}. You can
                continue without them or go back and fix the address.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              Funding Profile
            </h2>

            <div>
              <label className="mb-2 block text-slate-300">
                Organization Type
              </label>

              <select
                value={organizationType}
                onChange={(e) =>
                  setOrganizationType(
                    e.target.value
                  )
                }
                className="w-full rounded-lg p-3 text-black"
              >
                <option>
                  Nonprofit
                </option>
                <option>
                  School District
                </option>
                <option>
                  College / University
                </option>
                <option>
                  Municipality
                </option>
                <option>
                  Tribal Government
                </option>
                <option>
                  For-Profit
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-slate-300">
                Operating Budget
              </label>

              <select
                value={budgetRange}
                onChange={(e) =>
                  setBudgetRange(
                    e.target.value
                  )
                }
                className="w-full rounded-lg p-3 text-black"
              >
                <option>
                  Under $100K
                </option>
                <option>
                  $100K - $500K
                </option>
                <option>
                  $500K - $1M
                </option>
                <option>
                  $1M - $5M
                </option>
                <option>
                  $5M+
                </option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-slate-300">
                Funding Priorities
                <Tooltip text="Describe major funding areas such as education, workforce development, housing, healthcare or technology." />
              </label>

              <textarea
                rows={4}
                value={
                  fundingPriorities
                }
                onChange={(e) =>
                  setFundingPriorities(
                    e.target.value
                  )
                }
                className="w-full rounded-lg p-3 text-black"
                placeholder="Education, housing, workforce development..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-slate-300">
                  Primary State
                  <Tooltip text="Turns on state-grant scanning for your state, where we have a source configured." />
                </label>

                <select
                  value={primaryState}
                  onChange={(e) => setPrimaryState(e.target.value)}
                  className="w-full rounded-lg p-3 text-black"
                >
                  <option value="">Select...</option>
                  {US_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-slate-300">
                  Service Scope
                </label>

                <select
                  value={serviceScope}
                  onChange={(e) => setServiceScope(e.target.value)}
                  className="w-full rounded-lg p-3 text-black"
                >
                  <option>County</option>
                  <option>Regional</option>
                  <option>Statewide</option>
                  <option>National</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-slate-300">
                  EIN
                </label>

                <input
                  type="text"
                  placeholder="XX-XXXXXXX"
                  className="w-full rounded-lg p-3 text-black"
                  value={ein}
                  onChange={(e) => setEin(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-slate-300">
                  UEI
                  <Tooltip text="Unique Entity Identifier from SAM.gov - needed for most federal applications." />
                </label>

                <input
                  type="text"
                  className="w-full rounded-lg p-3 text-black"
                  value={uei}
                  onChange={(e) => setUei(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-slate-300">
                Populations Served
              </label>

              <input
                type="text"
                placeholder="Veterans, youth, families experiencing homelessness..."
                className="w-full rounded-lg p-3 text-black"
                value={populationsServed}
                onChange={(e) => setPopulationsServed(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-slate-300">
                Program Areas
                <Tooltip text="The specific programs and services your organization runs day to day - added to your grant-matching keywords alongside what we found on your website." />
              </label>

              <input
                type="text"
                placeholder="Transitional housing, job training, case management..."
                className="w-full rounded-lg p-3 text-black"
                value={programAreas}
                onChange={(e) => setProgramAreas(e.target.value)}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              Federal Application Details
            </h2>

            <p className="text-sm text-slate-400">
              These fill in your SF-424, SF-424A and SF-424B forms
              automatically so they aren&apos;t left blank. Everything here is
              optional - skip what you don&apos;t have yet and finish it later in
              Workspace Settings &gt; Grant Profile. Your state comes from the
              Funding Profile step.
            </p>

            <TextField
              label="Legal Organization Name"
              value={legalName}
              onChange={setLegalName}
              placeholder="Exactly as registered with the IRS / SAM.gov"
              tooltip="The name on your SAM.gov registration. Leave blank to use your organization name."
            />

            <TextField label="Street Address" value={streetAddress} onChange={setStreetAddress} placeholder="123 Main Street" />
            <TextField label="Address Line 2" value={addressLine2} onChange={setAddressLine2} placeholder="Suite, unit, floor (optional)" />

            <div className="grid gap-4 md:grid-cols-3">
              <TextField label="City" value={city} onChange={setCity} />
              <TextField label="ZIP Code" value={zipCode} onChange={setZipCode} placeholder="36601 or 36601-1234" />
              <TextField label="County" value={county} onChange={setCounty} />
            </div>

            <TextField label="Organization Phone" value={orgPhone} onChange={setOrgPhone} placeholder="(555) 123-4567" type="tel" />

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Congressional District (Applicant)"
                value={districtApplicant}
                onChange={setDistrictApplicant}
                placeholder="AL-001"
                tooltip="Look yours up at house.gov/representatives/find-your-representative. Format: two-letter state, dash, three digits."
              />
              <TextField
                label="Congressional District (Project)"
                value={districtProject}
                onChange={setDistrictProject}
                placeholder="Same as applicant if the same"
              />
            </div>

            <h3 className="pt-2 text-lg font-semibold text-white">
              Authorized Representative
            </h3>
            <p className="-mt-3 text-sm text-slate-400">
              The person who signs applications for your organization.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Full Name" value={repName} onChange={setRepName} />
              <TextField label="Title" value={repTitle} onChange={setRepTitle} placeholder="Executive Director" />
              <TextField label="Phone" value={repPhone} onChange={setRepPhone} type="tel" />
              <TextField label="Email" value={repEmail} onChange={setRepEmail} type="email" />
            </div>

            <h3 className="pt-2 text-lg font-semibold text-white">
              SF-424 Certifications
            </h3>
            <p className="-mt-3 text-sm text-slate-400">
              These are your organization&apos;s own answers - we never
              guess them. Leave on &quot;Not answered&quot; if you&apos;re
              unsure; the form will flag it for you to complete.
            </p>

            <div>
              <label className="mb-2 flex items-center gap-2 text-slate-300">
                Item 19: Executive Order 12372 review
                <Tooltip text="Whether the application is subject to state review under E.O. 12372. Most federal programs say so in the funding notice." />
              </label>
              <select
                className="w-full rounded-lg p-3 text-black"
                value={eo12372}
                onChange={(e) => setEo12372(e.target.value)}
              >
                <option value="">Not answered</option>
                <option value="a">a. Submitted to the State for review (date to be added)</option>
                <option value="b">b. Subject to E.O. 12372, but not selected by the State for review</option>
                <option value="c">c. Program is not covered by E.O. 12372</option>
              </select>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-slate-300">
                Item 20: Delinquent on any federal debt?
                <Tooltip text="Answer for your organization. If yes, an explanation must be attached to the application." />
              </label>
              <select
                className="w-full rounded-lg p-3 text-black"
                value={federalDebt}
                onChange={(e) => setFederalDebt(e.target.value)}
              >
                <option value="">Not answered</option>
                <option value="no">No</option>
                <option value="yes">Yes (an explanation will be needed)</option>
              </select>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              Grant Goals
            </h2>

            <label className="mb-2 flex items-center gap-2 text-slate-300">
              Strategic Funding Goals
              <Tooltip text="Describe funding objectives, community impact goals and growth plans." />
            </label>

            <textarea
              rows={8}
              value={grantGoals}
              onChange={(e) =>
                setGrantGoals(
                  e.target.value
                )
              }
              className="w-full rounded-lg p-3 text-black"
              placeholder="Describe major initiatives, new programs, expansion plans and funding goals..."
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">
              Workspace Setup
            </h2>

            <div className="rounded-xl bg-slate-800 p-4">
              ✅ Grant Discovery Engine
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              ✅ Funder Match Analysis
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              ✅ Application Builder
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              ✅ Intelligence Suite
            </div>

            <div className="rounded-xl bg-slate-800 p-4">
              ✅ Risk Assessment
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              Workspace Ready
            </h2>

            <p className="text-slate-300">
              Your GrantScout Pro
              workspace has been
              configured and is
              ready to launch. You can update any of these details later in
              Workspace Settings &gt; Grant Profile, or reopen onboarding.
            </p>

            <div className="rounded-2xl border border-cyan-800 bg-cyan-950/30 p-6 text-left">
              <h3 className="mb-4 text-xl font-semibold text-cyan-300">
                Organization Snapshot
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <strong>Name:</strong>{" "}
                  {
                    profile?.organizationName
                  }
                </div>

                <div>
                  <strong>Type:</strong>{" "}
                  {
                    organizationType
                  }
                </div>

                <div>
                  <strong>Budget:</strong>{" "}
                  {budgetRange}
                </div>

                <div>
                  <strong>Website:</strong>{" "}
                  {profile?.website}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {saveError && (
        <p className="mt-4 text-sm text-amber-400">{saveError}</p>
      )}

      <div className="mt-8 flex justify-between">
        <button
          onClick={previousStep}
          className="rounded-lg bg-slate-700 px-5 py-3"
        >
          Back
        </button>

        {step === 1 ? (
          <button
            onClick={
              analyzeOrganization
            }
            disabled={loading}
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black"
          >
            {loading
              ? "Analyzing..."
              : "Analyze Organization"}
          </button>
        ) : step < TOTAL_STEPS ? (
          <button
            onClick={nextStep}
            disabled={savingProfile}
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black disabled:opacity-60"
          >
            {savingProfile ? "Saving..." : "Next"}
          </button>
        ) : (
          <button
            onClick={() =>
              router.push("/home")
            }
            className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-black"
          >
            Launch GrantScout Pro
          </button>
        )}
      </div>
    </div>
  );
}
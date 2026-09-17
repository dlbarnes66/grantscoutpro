"use client";

import { useState } from "react";
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

  const stepTitles: Record<number, string> = {
    1: "Organization Discovery",
    2: "Profile Review",
    3: "Funding Profile",
    4: "Grant Goals",
    5: "Workspace Setup",
    6: "Launch Workspace",
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
          linkedin,
          facebook,
          instagram,
        }),
      });

      const data = await response.json();

      setProfile(data);

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
        "Some of your answers couldn't be saved just now - you can add or fix them anytime from Workspace Settings > Grant Profile."
      );
    } finally {
      setSavingProfile(false);
    }
  }

  async function nextStep() {
    if (step === 4) {
      await saveProfile();
    }
    setStep((prev) =>
      Math.min(prev + 1, 6)
    );
  }

  function previousStep() {
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
          Step {step} of 6 •{" "}
          {stepTitles[step]}
        </p>

        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>Getting Started</span>
            <span>
              {Math.round(
                (step / 6) * 100
              )}
              % Complete
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{
                width: `${
                  (step / 6) * 100
                }%`,
              }}
            />
          </div>

          <div className="mt-4 grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map(
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

        {step === 5 && (
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

        {step === 6 && (
          <div className="space-y-8 text-center">
            <h2 className="text-3xl font-bold text-white">
              Workspace Ready
            </h2>

            <p className="text-slate-300">
              Your GrantScout Pro
              workspace has been
              configured and is
              ready to launch.
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
        ) : step < 6 ? (
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
"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { US_STATES } from "@/lib/location/states";

// Everything here is a superset of what /onboarding collects (Organization
// Discovery + Funding Profile + Grant Goals). Onboarding only ever
// persisted organizationName/mission/website/focusAreas - the rest
// (social links, EIN/UEI, state, budget, populations served, goals, etc.)
// was captured in the onboarding form's local state and then silently
// dropped, so anyone who skipped a field there - or whose org has since
// changed - had no way to add or fix it afterward. This page is that way.
type ProfileData = {
  organizationName: string;
  organizationType: string;
  mission: string;
  website: string;

  linkedin: string;
  facebook: string;
  instagram: string;

  country: string;
  state: string;
  city: string;

  nonprofitStatus: string;
  ein: string;
  uei: string;

  staffSize: number | null;
  annualBudget: number | null;
  budgetRange: string;
  grantExperience: string;

  focusAreas: string[];
  populationsServed: string[];
  geographicService: string[];
  serviceScope: string;

  pastGrants: string;
  pastWins: number | null;
  pastLosses: number | null;

  strategicGoals: string;
  priorityAreas: string;
};

const EMPTY: ProfileData = {
  organizationName: "",
  organizationType: "",
  mission: "",
  website: "",
  linkedin: "",
  facebook: "",
  instagram: "",
  country: "",
  state: "",
  city: "",
  nonprofitStatus: "",
  ein: "",
  uei: "",
  staffSize: null,
  annualBudget: null,
  budgetRange: "",
  grantExperience: "",
  focusAreas: [],
  populationsServed: [],
  geographicService: [],
  serviceScope: "",
  pastGrants: "",
  pastWins: null,
  pastLosses: null,
  strategicGoals: "",
  priorityAreas: "",
};

const ORG_TYPES = [
  "Nonprofit",
  "School District",
  "College / University",
  "Municipality",
  "Tribal Government",
  "For-Profit",
];

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wide text-slate-500">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg bg-slate-900 border border-slate-700 p-3 text-white placeholder:text-slate-500 disabled:opacity-60";

export default function WorkspaceGrantProfileSettings({ workspaceId }: { workspaceId: string }) {
  const [profile, setProfile] = useState<ProfileData>(EMPTY);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Comma-separated text is easier to type than a chip picker for a
  // form this size - split back into arrays only on save.
  const [focusAreasText, setFocusAreasText] = useState("");
  const [populationsText, setPopulationsText] = useState("");
  const [geoText, setGeoText] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    (async () => {
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/profile`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load profile");
        setProfile({ ...EMPTY, ...json.profile });
        setFocusAreasText((json.profile.focusAreas || []).join(", "));
        setPopulationsText((json.profile.populationsServed || []).join(", "));
        setGeoText((json.profile.geographicService || []).join(", "));
        setCanEdit(!!json.canEdit);
      } catch (err: any) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, [workspaceId]);

  function set<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const body = {
        ...profile,
        focusAreas: focusAreasText.split(",").map((s) => s.trim()).filter(Boolean),
        populationsServed: populationsText.split(",").map((s) => s.trim()).filter(Boolean),
        geographicService: geoText.split(",").map((s) => s.trim()).filter(Boolean),
      };

      const res = await fetch(`/api/workspaces/${workspaceId}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to save");

      setProfile({ ...EMPTY, ...json.profile });
      setFocusAreasText((json.profile.focusAreas || []).join(", "));
      setPopulationsText((json.profile.populationsServed || []).join(", "));
      setGeoText((json.profile.geographicService || []).join(", "));
      setMessage("Grant profile updated.");
    } catch (err: any) {
      setError(err?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-400">Loading...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!canEdit && (
        <Card className="p-4 border-amber-800 bg-amber-950/20">
          <p className="text-amber-400 text-sm">
            You can view this profile, but only workspace owners or admins can edit it.
          </p>
        </Card>
      )}

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Organization Basics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Organization Name">
            <input
              className={inputClass}
              disabled={!canEdit}
              value={profile.organizationName}
              onChange={(e) => set("organizationName", e.target.value)}
            />
          </Field>
          <Field label="Organization Type">
            <select
              className={inputClass}
              disabled={!canEdit}
              value={profile.organizationType}
              onChange={(e) => set("organizationType", e.target.value)}
            >
              <option value="">Select...</option>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Website">
            <input
              className={inputClass}
              disabled={!canEdit}
              placeholder="https://yourorganization.org"
              value={profile.website}
              onChange={(e) => set("website", e.target.value)}
            />
          </Field>
          <Field label="Nonprofit Status">
            <input
              className={inputClass}
              disabled={!canEdit}
              placeholder="e.g. 501(c)(3)"
              value={profile.nonprofitStatus}
              onChange={(e) => set("nonprofitStatus", e.target.value)}
            />
          </Field>
        </div>
        <Field label="Mission">
          <textarea
            rows={4}
            className={inputClass}
            disabled={!canEdit}
            value={profile.mission}
            onChange={(e) => set("mission", e.target.value)}
          />
        </Field>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Social Media</h2>
        <p className="text-sm text-slate-400">
          Offered during onboarding - add these now if they were skipped, or fix them if they've
          changed. Used to enrich organization discovery, not required for grant matching.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="LinkedIn">
            <input
              className={inputClass}
              disabled={!canEdit}
              placeholder="https://linkedin.com/company/your-org"
              value={profile.linkedin}
              onChange={(e) => set("linkedin", e.target.value)}
            />
          </Field>
          <Field label="Facebook">
            <input
              className={inputClass}
              disabled={!canEdit}
              placeholder="https://facebook.com/your-org"
              value={profile.facebook}
              onChange={(e) => set("facebook", e.target.value)}
            />
          </Field>
          <Field label="Instagram">
            <input
              className={inputClass}
              disabled={!canEdit}
              placeholder="https://instagram.com/your-org"
              value={profile.instagram}
              onChange={(e) => set("instagram", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Location</h2>
        <p className="text-sm text-slate-400">
          State-grant scanning only runs once this is set (currently supported for Alabama and
          North Carolina, with more states added over time).
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="State">
            <select
              className={inputClass}
              disabled={!canEdit}
              value={profile.state}
              onChange={(e) => set("state", e.target.value)}
            >
              <option value="">Select...</option>
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="City">
            <input
              className={inputClass}
              disabled={!canEdit}
              value={profile.city}
              onChange={(e) => set("city", e.target.value)}
            />
          </Field>
          <Field label="Country">
            <input
              className={inputClass}
              disabled={!canEdit}
              value={profile.country}
              onChange={(e) => set("country", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Tax IDs</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="EIN">
            <input
              className={inputClass}
              disabled={!canEdit}
              placeholder="XX-XXXXXXX"
              value={profile.ein}
              onChange={(e) => set("ein", e.target.value)}
            />
          </Field>
          <Field label="UEI" hint="Unique Entity Identifier (SAM.gov) - needed for most federal applications.">
            <input
              className={inputClass}
              disabled={!canEdit}
              value={profile.uei}
              onChange={(e) => set("uei", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Financials &amp; Capacity</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Staff Size">
            <input
              type="number"
              min={0}
              className={inputClass}
              disabled={!canEdit}
              value={profile.staffSize ?? ""}
              onChange={(e) => set("staffSize", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Annual Budget ($)">
            <input
              type="number"
              min={0}
              className={inputClass}
              disabled={!canEdit}
              value={profile.annualBudget ?? ""}
              onChange={(e) => set("annualBudget", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Budget Range" hint="The bucket picked during onboarding, if a precise figure above isn't set.">
            <select
              className={inputClass}
              disabled={!canEdit}
              value={profile.budgetRange}
              onChange={(e) => set("budgetRange", e.target.value)}
            >
              <option value="">Select...</option>
              <option>Under $100K</option>
              <option>$100K - $500K</option>
              <option>$500K - $1M</option>
              <option>$1M - $5M</option>
              <option>$5M+</option>
            </select>
          </Field>
          <Field label="Service Scope">
            <select
              className={inputClass}
              disabled={!canEdit}
              value={profile.serviceScope}
              onChange={(e) => set("serviceScope", e.target.value)}
            >
              <option value="">Select...</option>
              <option>County</option>
              <option>Regional</option>
              <option>Statewide</option>
              <option>National</option>
            </select>
          </Field>
          <Field label="Grant Experience">
            <input
              className={inputClass}
              disabled={!canEdit}
              placeholder="e.g. First-time applicant, 5+ years"
              value={profile.grantExperience}
              onChange={(e) => set("grantExperience", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Focus &amp; Reach</h2>
        <div className="grid gap-4 md:grid-cols-1">
          <Field label="Focus Areas" hint="Comma-separated (e.g. housing, education, workforce).">
            <input
              className={inputClass}
              disabled={!canEdit}
              value={focusAreasText}
              onChange={(e) => setFocusAreasText(e.target.value)}
            />
          </Field>
          <Field label="Populations Served" hint="Comma-separated.">
            <input
              className={inputClass}
              disabled={!canEdit}
              value={populationsText}
              onChange={(e) => setPopulationsText(e.target.value)}
            />
          </Field>
          <Field label="Geographic Service Area" hint="Comma-separated (cities, counties, states, or 'National').">
            <input
              className={inputClass}
              disabled={!canEdit}
              value={geoText}
              onChange={(e) => setGeoText(e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Grant History</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Past Wins">
            <input
              type="number"
              min={0}
              className={inputClass}
              disabled={!canEdit}
              value={profile.pastWins ?? ""}
              onChange={(e) => set("pastWins", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
          <Field label="Past Losses">
            <input
              type="number"
              min={0}
              className={inputClass}
              disabled={!canEdit}
              value={profile.pastLosses ?? ""}
              onChange={(e) => set("pastLosses", e.target.value === "" ? null : Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="Notable Past Grants">
          <textarea
            rows={3}
            className={inputClass}
            disabled={!canEdit}
            value={profile.pastGrants}
            onChange={(e) => set("pastGrants", e.target.value)}
          />
        </Field>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Goals</h2>
        <Field label="Strategic Funding Goals">
          <textarea
            rows={5}
            className={inputClass}
            disabled={!canEdit}
            value={profile.strategicGoals}
            onChange={(e) => set("strategicGoals", e.target.value)}
          />
        </Field>
        <Field label="Priority Areas">
          <textarea
            rows={3}
            className={inputClass}
            disabled={!canEdit}
            value={profile.priorityAreas}
            onChange={(e) => set("priorityAreas", e.target.value)}
          />
        </Field>
      </Card>

      {canEdit && (
        <div className="flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00E5FF] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-[#06131F] font-medium rounded-lg transition"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          {message && <p className="text-[#00E5FF] text-sm">{message}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
      )}
      {!canEdit && error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}

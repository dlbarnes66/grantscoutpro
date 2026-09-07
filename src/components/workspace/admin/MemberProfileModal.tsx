"use client";

import { useEffect, useState } from "react";

type Profile = {
  organizationName?: string | null;
  organizationType?: string | null;
  mission?: string | null;
  website?: string | null;
  country?: string | null;
  state?: string | null;
  city?: string | null;
  nonprofitStatus?: string | null;
  ein?: string | null;
  staffSize?: number | null;
  annualBudget?: number | null;
  grantExperience?: string | null;
  focusAreas?: string[];
  populationsServed?: string[];
  geographicService?: string[];
  pastGrants?: string | null;
  pastWins?: number | null;
  pastLosses?: number | null;
  strategicGoals?: string | null;
  priorityAreas?: string | null;
};

const EMPTY_PROFILE: Profile = {};

function toCsv(value: string[] | undefined): string {
  return (value || []).join(", ");
}

function fromCsv(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export default function MemberProfileModal({
  workspaceId,
  userId,
  onClose,
  onSaved,
}: {
  workspaceId: string;
  userId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/admin/members/profile?userId=${encodeURIComponent(userId)}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load profile");
        if (cancelled) return;
        setName(json.user?.name || "");
        setImage(json.user?.image || "");
        setEmail(json.user?.email || "");
        setProfile(json.profile || EMPTY_PROFILE);
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaceId, userId]);

  const setField = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const setNumberField = (key: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfile((prev) => ({ ...prev, [key]: value === "" ? null : Number(value) }));
  };

  const setCsvField = (key: "focusAreas" | "populationsServed" | "geographicService") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setProfile((prev) => ({ ...prev, [key]: fromCsv(e.target.value) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/admin/members/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name,
          image,
          profile: {
            organizationName: profile.organizationName || null,
            organizationType: profile.organizationType || null,
            mission: profile.mission || null,
            website: profile.website || null,
            country: profile.country || null,
            state: profile.state || null,
            city: profile.city || null,
            nonprofitStatus: profile.nonprofitStatus || null,
            ein: profile.ein || null,
            staffSize: profile.staffSize ?? null,
            annualBudget: profile.annualBudget ?? null,
            grantExperience: profile.grantExperience || null,
            focusAreas: profile.focusAreas || [],
            populationsServed: profile.populationsServed || [],
            geographicService: profile.geographicService || [],
            pastGrants: profile.pastGrants || null,
            pastWins: profile.pastWins ?? null,
            pastLosses: profile.pastLosses ?? null,
            strategicGoals: profile.strategicGoals || null,
            priorityAreas: profile.priorityAreas || null,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save profile");
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <h3 className="text-lg font-bold">Edit Member Profile</h3>
            {email && <p className="text-xs text-gray-500">{email}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700">
            ✕
          </button>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-gray-600">Loading profile...</p>
        ) : (
          <div className="space-y-6 p-6">
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Basic Info</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  Name
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Avatar Image URL
                  <input
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Organization Profile
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  Organization Name
                  <input
                    value={profile.organizationName || ""}
                    onChange={setField("organizationName")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Organization Type
                  <input
                    value={profile.organizationType || ""}
                    onChange={setField("organizationType")}
                    placeholder="Nonprofit, Foundation, Government..."
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                Mission
                <textarea
                  value={profile.mission || ""}
                  onChange={setField("mission")}
                  rows={2}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  Website
                  <input
                    value={profile.website || ""}
                    onChange={setField("website")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  EIN
                  <input
                    value={profile.ein || ""}
                    onChange={setField("ein")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  City
                  <input value={profile.city || ""} onChange={setField("city")} className="rounded border px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  State
                  <input value={profile.state || ""} onChange={setField("state")} className="rounded border px-3 py-2 text-sm" />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Country
                  <input
                    value={profile.country || ""}
                    onChange={setField("country")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  Nonprofit Status
                  <input
                    value={profile.nonprofitStatus || ""}
                    onChange={setField("nonprofitStatus")}
                    placeholder="501(c)(3), pending..."
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Staff Size
                  <input
                    type="number"
                    value={profile.staffSize ?? ""}
                    onChange={setNumberField("staffSize")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Annual Budget ($)
                  <input
                    type="number"
                    value={profile.annualBudget ?? ""}
                    onChange={setNumberField("annualBudget")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1 text-sm">
                Grant Experience
                <input
                  value={profile.grantExperience || ""}
                  onChange={setField("grantExperience")}
                  placeholder="First-time applicant, experienced, etc."
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm">
                Focus Areas (comma-separated)
                <input
                  defaultValue={toCsv(profile.focusAreas)}
                  onChange={setCsvField("focusAreas")}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Populations Served (comma-separated)
                <input
                  defaultValue={toCsv(profile.populationsServed)}
                  onChange={setCsvField("populationsServed")}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Geographic Service Area (comma-separated)
                <input
                  defaultValue={toCsv(profile.geographicService)}
                  onChange={setCsvField("geographicService")}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Grant History</h4>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                  Past Wins
                  <input
                    type="number"
                    value={profile.pastWins ?? ""}
                    onChange={setNumberField("pastWins")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Past Losses
                  <input
                    type="number"
                    value={profile.pastLosses ?? ""}
                    onChange={setNumberField("pastLosses")}
                    className="rounded border px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <label className="flex flex-col gap-1 text-sm">
                Past Grants Notes
                <textarea
                  value={profile.pastGrants || ""}
                  onChange={setField("pastGrants")}
                  rows={2}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
            </section>

            <section className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Strategy</h4>
              <label className="flex flex-col gap-1 text-sm">
                Strategic Goals
                <textarea
                  value={profile.strategicGoals || ""}
                  onChange={setField("strategicGoals")}
                  rows={2}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Priority Areas
                <textarea
                  value={profile.priorityAreas || ""}
                  onChange={setField("priorityAreas")}
                  rows={2}
                  className="rounded border px-3 py-2 text-sm"
                />
              </label>
            </section>
          </div>
        )}

        <div className="sticky bottom-0 flex justify-end gap-3 border-t bg-white px-6 py-4">
          <button type="button" onClick={onClose} className="rounded border px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saving}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

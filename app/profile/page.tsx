"use client";

import { useEffect, useState } from "react";
import ProfileSection from "./components/ProfileSection";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    const res = await fetch("/api/profile", { credentials: "include" });
    const data = await res.json();
    setProfile(data);
    setLoading(false);
  }

  async function saveSection(endpoint: string, data: any) {
    setSaving(true);
    await fetch(`/api/profile/sections/${endpoint}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });
    setSaving(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Organization Profile</h1>

        {saving && (
          <div className="mb-4 text-sm text-blue-600">Saving changes…</div>
        )}

        {/* BASIC INFO */}
        <ProfileSection
          title="Basic Information"
          description="Tell us about your organization."
        >
          <input
            type="text"
            placeholder="Organization Name"
            defaultValue={profile.organizationName || ""}
            onChange={(e) =>
              saveSection("basic", { organizationName: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="Organization Type (nonprofit, gov, etc.)"
            defaultValue={profile.organizationType || ""}
            onChange={(e) =>
              saveSection("basic", { organizationType: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />

          <textarea
            placeholder="Mission Statement"
            defaultValue={profile.mission || ""}
            onChange={(e) => saveSection("basic", { mission: e.target.value })}
            className="w-full border rounded-lg p-2 h-24"
          />

          <input
            type="text"
            placeholder="Website"
            defaultValue={profile.website || ""}
            onChange={(e) => saveSection("basic", { website: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </ProfileSection>

        {/* LOCATION */}
        <ProfileSection
          title="Location"
          description="Where is your organization based?"
        >
          <input
            type="text"
            placeholder="Country"
            defaultValue={profile.country || ""}
            onChange={(e) =>
              saveSection("location", { country: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="State"
            defaultValue={profile.state || ""}
            onChange={(e) => saveSection("location", { state: e.target.value })}
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="City"
            defaultValue={profile.city || ""}
            onChange={(e) => saveSection("location", { city: e.target.value })}
            className="w-full border rounded-lg p-2"
          />
        </ProfileSection>

        {/* CAPACITY */}
        <ProfileSection
          title="Organizational Capacity"
          description="Tell us about your size and experience."
        >
          <input
            type="number"
            placeholder="Staff Size"
            defaultValue={profile.staffSize || ""}
            onChange={(e) =>
              saveSection("capacity", { staffSize: Number(e.target.value) })
            }
            className="w-full border rounded-lg p-2"
          />

          <input
            type="number"
            placeholder="Annual Budget"
            defaultValue={profile.annualBudget || ""}
            onChange={(e) =>
              saveSection("capacity", { annualBudget: Number(e.target.value) })
            }
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="Grant Experience (beginner, intermediate, advanced)"
            defaultValue={profile.grantExperience || ""}
            onChange={(e) =>
              saveSection("capacity", { grantExperience: e.target.value })
            }
            className="w-full border rounded-lg p-2"
          />
        </ProfileSection>

        {/* PROGRAM AREAS */}
        <ProfileSection
          title="Program Areas"
          description="What does your organization focus on?"
        >
          <input
            type="text"
            placeholder="Focus Areas (comma separated)"
            defaultValue={profile.focusAreas?.join(", ") || ""}
            onChange={(e) =>
              saveSection("programs", {
                focusAreas: e.target.value.split(",").map((s) => s.trim()),
              })
            }
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="Populations Served (comma separated)"
            defaultValue={profile.populationsServed?.join(", ") || ""}
            onChange={(e) =>
              saveSection("programs", {
                populationsServed: e.target.value
                  .split(",")
                  .map((s) => s.trim()),
              })
            }
            className="w-full border rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="Geographic Service Area (comma separated)"
            defaultValue={profile.geographicService?.join(", ") || ""}
            onChange={(e) =>
              saveSection("programs", {
                geographicService: e.target.value
                  .split(",")
                  .map((s) => s.trim()),
              })
            }
            className="w-full border rounded-lg p-2"
          />
        </ProfileSection>

        {/* HISTORY */}
        <ProfileSection
          title="Grant History"
          description="Tell us about your past grant performance."
        >
          <textarea
            placeholder="Past Grants"
            defaultValue={profile.pastGrants || ""}
            onChange={(e) =>
              saveSection("history", { pastGrants: e.target.value })
            }
            className="w-full border rounded-lg p-2 h-24"
          />

          <input
            type="number"
            placeholder="Past Wins"
            defaultValue={profile.pastWins || ""}
            onChange={(e) =>
              saveSection("history", { pastWins: Number(e.target.value) })
            }
            className="w-full border rounded-lg p-2"
          />

          <input
            type="number"
            placeholder="Past Losses"
            defaultValue={profile.pastLosses || ""}
            onChange={(e) =>
              saveSection("history", { pastLosses: Number(e.target.value) })
            }
            className="w-full border rounded-lg p-2"
          />
        </ProfileSection>

        {/* STRATEGY */}
        <ProfileSection
          title="Strategic Priorities"
          description="Help us understand your long-term goals."
        >
          <textarea
            placeholder="Strategic Goals"
            defaultValue={profile.strategicGoals || ""}
            onChange={(e) =>
              saveSection("strategy", { strategicGoals: e.target.value })
            }
            className="w-full border rounded-lg p-2 h-24"
          />

          <textarea
            placeholder="Priority Areas"
            defaultValue={profile.priorityAreas || ""}
            onChange={(e) =>
              saveSection("strategy", { priorityAreas: e.target.value })
            }
            className="w-full border rounded-lg p-2 h-24"
          />
        </ProfileSection>
      </div>
    </div>
  );
}

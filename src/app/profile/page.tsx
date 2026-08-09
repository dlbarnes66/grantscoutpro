"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState({
    basics: { name: "", type: "", website: "", ein: "" },
    location: { state: "", county: "" },
    mission: { category: "", focusAreas: [] as string[] },
    funding: { amount: "", purpose: "", timeline: "", urgency: "" },
    eligibility: {
      populations: [] as string[],
      orgType: "",
      geoEligibility: "",
      restrictions: ""
    }
  });

  // Load profile data
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/profile/full");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load profile", err);
      }
      setLoading(false);
    };

    load();
  }, []);

  const saveSection = async (section: string, data: any) => {
    await fetch(`/api/profile/sections/${section}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-900">Organization Profile</h1>
        <p className="text-gray-600 mt-2">
          Update your organization information at any time.
        </p>

        <div className="mt-10 space-y-10">

          {/* ---------------------- BASICS ---------------------- */}
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Organization Basics</h2>

            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Organization Name"
                value={profile.basics.name}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    basics: { ...profile.basics, name: e.target.value }
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Organization Type"
                value={profile.basics.type}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    basics: { ...profile.basics, type: e.target.value }
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Website"
                value={profile.basics.website}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    basics: { ...profile.basics, website: e.target.value }
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="EIN"
                value={profile.basics.ein}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    basics: { ...profile.basics, ein: e.target.value }
                  })
                }
              />
            </div>

            <button
              onClick={() => saveSection("basic", profile.basics)}
              className="mt-6 px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Save Basics
            </button>
          </section>

          {/* ---------------------- LOCATION ---------------------- */}
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Location</h2>

            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="State"
                value={profile.location.state}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, state: e.target.value }
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="County"
                value={profile.location.county}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, county: e.target.value }
                  })
                }
              />
            </div>

            <button
              onClick={() => saveSection("location", profile.location)}
              className="mt-6 px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Save Location
            </button>
          </section>

          {/* ---------------------- MISSION ---------------------- */}
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Mission & Focus Areas</h2>

            <input
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Mission Category"
              value={profile.mission.category}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  mission: { ...profile.mission, category: e.target.value }
                })
              }
            />

            <textarea
              className="w-full border rounded-lg px-3 py-2 h-24"
              placeholder="Focus Areas (comma separated)"
              value={profile.mission.focusAreas.join(", ")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  mission: {
                    ...profile.mission,
                    focusAreas: e.target.value.split(",").map((x) => x.trim())
                  }
                })
              }
            />

            <button
              onClick={() => saveSection("programs", profile.mission)}
              className="mt-6 px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Save Mission
            </button>
          </section>

          {/* ---------------------- CAPACITY ---------------------- */}
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Capacity & Readiness</h2>

            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Staff Size"
                onChange={(e) =>
                  setProfile({
                    ...profile,
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Annual Budget"
                onChange={(e) =>
                  setProfile({
                    ...profile,
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Readiness Level"
                onChange={(e) =>
                  setProfile({
                    ...profile,
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Past Grant Experience"
                onChange={(e) =>
                  setProfile({
                    ...profile,
                  })
                }
              />
            </div>

            <button
              className="mt-6 px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Save Capacity
            </button>
          </section>

          {/* ---------------------- FUNDING ---------------------- */}
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Funding Needs</h2>

            <div className="space-y-4">
              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Funding Amount"
                value={profile.funding.amount}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    funding: { ...profile.funding, amount: e.target.value }
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Purpose"
                value={profile.funding.purpose}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    funding: { ...profile.funding, purpose: e.target.value }
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Timeline"
                value={profile.funding.timeline}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    funding: { ...profile.funding, timeline: e.target.value }
                  })
                }
              />

              <input
                className="w-full border rounded-lg px-3 py-2"
                placeholder="Urgency"
                value={profile.funding.urgency}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    funding: { ...profile.funding, urgency: e.target.value }
                  })
                }
              />
            </div>

            <button
              onClick={() => saveSection("strategy", profile.funding)}
              className="mt-6 px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Save Funding
            </button>
          </section>

          {/* ---------------------- ELIGIBILITY ---------------------- */}
          <section className="bg-white p-6 rounded-xl shadow border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Eligibility Filters</h2>

            <textarea
              className="w-full border rounded-lg px-3 py-2 h-24 mb-4"
              placeholder="Populations Served (comma separated)"
              value={profile.eligibility.populations.join(", ")}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  eligibility: {
                    ...profile.eligibility,
                    populations: e.target.value.split(",").map((x) => x.trim())
                  }
                })
              }
            />

            <input
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Organization Type"
              value={profile.eligibility.orgType}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  eligibility: {
                    ...profile.eligibility,
                    orgType: e.target.value
                  }
                })
              }
            />

            <input
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Geographic Eligibility"
              value={profile.eligibility.geoEligibility}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  eligibility: {
                    ...profile.eligibility,
                    geoEligibility: e.target.value
                  }
                })
              }
            />

            <textarea
              className="w-full border rounded-lg px-3 py-2 h-24"
              placeholder="Restrictions"
              value={profile.eligibility.restrictions}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  eligibility: {
                    ...profile.eligibility,
                    restrictions: e.target.value
                  }
                })
              }
            />

            <button
              onClick={() => saveSection("history", profile.eligibility)}
              className="mt-6 px-6 py-2 rounded-lg border border-yellow-400 text-yellow-600 bg-white hover:bg-yellow-50 transition"
            >
              Save Eligibility
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

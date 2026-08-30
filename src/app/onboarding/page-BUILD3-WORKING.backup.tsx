"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
const [website, setWebsite] = useState("");
const [linkedin, setLinkedin] = useState("");
const [facebook, setFacebook] = useState("");
const [instagram, setInstagram] = useState("");
const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
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

console.log("Onboarding Response:", data);

setStep(2);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
}
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white">
          GrantScout Pro Onboarding
        </h1>

        <p className="text-slate-400 mt-2">
          Step {step} of 6
        </p>
      </div>

      <div className="p-6 bg-[#11233F] rounded-xl">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white">
              Organization Discovery
            </h2>

            <div>
              <label className="block mb-2 text-slate-300">
                Organization Website *
              </label>

              <input
  type="text"
  placeholder="https://yourorganization.org"
  className="w-full p-3 rounded-lg text-black"
  value={website}
  onChange={(e) => setWebsite(e.target.value)}
/>
            </div>

            <div>
              <label className="block mb-2 text-slate-300">
                LinkedIn Company URL (optional)
              </label>

              <input
  type="text"
  placeholder="https://linkedin.com/company/your-org"
  className="w-full p-3 rounded-lg text-black"
  value={linkedin}
  onChange={(e) => setLinkedin(e.target.value)}
/>

              <p className="text-xs text-slate-400 mt-2">
                Adding LinkedIn helps GrantScout better understand your
                organization, programs, leadership, and funding priorities.
              </p>
            </div>

            <div>
              <label className="block mb-2 text-slate-300">
                Facebook URL (optional)
              </label>

              <input
  type="text"
  placeholder="https://facebook.com/your-org"
  className="w-full p-3 rounded-lg text-black"
  value={facebook}
  onChange={(e) => setFacebook(e.target.value)}
/>
            </div>

            <div>
              <label className="block mb-2 text-slate-300">
                Instagram URL (optional)
              </label>

             <input
  type="text"
  placeholder="https://instagram.com/your-org"
  className="w-full p-3 rounded-lg text-black"
  value={instagram}
  onChange={(e) => setInstagram(e.target.value)}
/>
            </div>
          </div>
        )}

        {step === 2 && (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold text-white">
      Review Organization Profile
    </h2>

    <div className="p-4 bg-slate-800 rounded-lg">
      <p><strong>Website:</strong> {profile?.body?.website}</p>
      <p><strong>LinkedIn:</strong> {profile?.body?.linkedin}</p>
      <p><strong>Facebook:</strong> {profile?.body?.facebook}</p>
      <p><strong>Instagram:</strong> {profile?.body?.instagram}</p>
    </div>
  </div>
)}

{step > 2 && (
  <div className="space-y-4">
    <h2 className="text-2xl font-semibold text-white">
      Step {step}
    </h2>

    <p className="text-slate-300">
      Placeholder for the next onboarding step.
    </p>
  </div>
)}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          className="px-4 py-2 rounded-lg bg-slate-700"
        >
          Back
        </button>

        {step === 1 ? (
  <button
    onClick={analyzeOrganization}
    disabled={loading}
    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold"
  >
    {loading ? "Analyzing..." : "Analyze Organization"}
  </button>
) : step < 6 ? (
  <button
    onClick={() => setStep(step + 1)}
    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold"
  >
    Next
  </button>
) : (
  <button
    onClick={() => router.push("/home")}
    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-semibold"
  >
    Enter Dashboard
  </button>
)}
      </div>
    </div>
  );
}
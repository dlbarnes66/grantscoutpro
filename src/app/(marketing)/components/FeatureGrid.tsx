"use client";

export default function FeatureGrid() {
  const features = [
    { title: "AI Grant Writer", desc: "Rewrite, summarize, extract, and improve narratives with Groq‑powered intelligence." },
    { title: "Reviewer Simulation", desc: "See strengths, weaknesses, and a predicted score before you submit." },
    { title: "Grant Matching Engine", desc: "AI analyzes your mission and programs to surface the best opportunities." },
    { title: "Collaboration Tools", desc: "Live presence, chat, comments, versioning, and document sharing." },
    { title: "Compliance & Eligibility", desc: "Instant eligibility checks and compliance scoring." },
    { title: "Funding Insights", desc: "Award patterns, competitiveness scoring, and risk analysis." },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-gray-900 text-center">
          Everything You Need to Win More Grants
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-12">
          {features.map((f) => (
            <div key={f.title} className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-3 text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

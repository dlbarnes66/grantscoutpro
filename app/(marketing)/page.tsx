export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="px-8 py-24 text-center space-y-6">
        <h1 className="text-5xl font-bold">
          GrantScout Pro
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The AI‑powered grant intelligence platform for nonprofits, governments, and foundations.
        </p>
        <a
          href="/signup"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded text-lg"
        >
          Get Started
        </a>
      </div>

      {/* Features */}
      <div className="px-8 py-16 grid grid-cols-3 gap-8">
        <Feature
          title="Grant Intelligence Engine"
          text="Search, filter, and analyze federal, state, foundation, and philanthropic grants."
        />
        <Feature
          title="AI Matching"
          text="Find the best grants for your mission, geography, and funding needs."
        />
        <Feature
          title="GrantRadar Scoring"
          text="AI‑powered eligibility, alignment, competitiveness, risk, and readiness scores."
        />
      </div>

      {/* CTA */}
      <div className="px-8 py-24 text-center">
        <a
          href="/pricing"
          className="inline-block bg-black text-white px-6 py-3 rounded text-lg"
        >
          View Pricing
        </a>
      </div>
    </div>
  );
}

function Feature({ title, text }: any) {
  return (
    <div className="border rounded p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-600 mt-2">{text}</p>
    </div>
  );
}

"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="px-8 py-24 text-center space-y-6">
        <h1 className="text-5xl font-bold">GrantScout Pro</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The AI‑powered grant intelligence platform for nonprofits,
          governments, and foundations.
        </p>
        <a
          href="/signup"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded text-lg"
        >
          Get Started
        </a>
      </div>

      {/* Animated Demo Section */}
      <div className="px-8 py-16 flex justify-center">
        <AnimatedDemo />
      </div>

      {/* Features */}
      <div className="px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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

/* ------------------------------
   Animated Demo Component
--------------------------------*/
function AnimatedDemo() {
  return (
    <div className="relative w-full max-w-4xl h-80 bg-gray-100 rounded-xl overflow-hidden shadow-xl border border-gray-200">
      {/* Sliding Search Panel */}
      <div className="absolute top-6 left-6 w-72 h-24 bg-white rounded-lg shadow animate-slide">
        <div className="p-4">
          <p className="font-semibold text-gray-700">Searching Grants…</p>
          <p className="text-sm text-gray-500">Federal • State • Foundation</p>
        </div>
      </div>

      {/* Fading Score Card */}
      <div className="absolute bottom-6 right-6 w-64 h-32 bg-blue-600 text-white rounded-lg shadow animate-fade">
        <div className="p-4">
          <p className="font-semibold text-lg">GrantRadar Score</p>
          <p className="text-sm opacity-90">Eligibility: 92%</p>
          <p className="text-sm opacity-90">Alignment: 88%</p>
        </div>
      </div>

      {/* Rising AI Writer Panel */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 h-28 bg-white rounded-lg shadow animate-rise">
        <div className="p-4">
          <p className="font-semibold text-gray-700">AI Proposal Writer</p>
          <p className="text-sm text-gray-500">Generating narrative…</p>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        .animate-slide {
          animation: slide 4s ease-in-out infinite;
        }
        .animate-fade {
          animation: fade 4s ease-in-out infinite;
        }
        .animate-rise {
          animation: rise 4s ease-in-out infinite;
        }

        @keyframes slide {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(25px);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes fade {
          0% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.4;
          }
        }

        @keyframes rise {
          0% {
            transform: translate(-50%, 12px);
          }
          50% {
            transform: translate(-50%, -12px);
          }
          100% {
            transform: translate(-50%, 12px);
          }
        }
      `}</style>
    </div>
  );
}

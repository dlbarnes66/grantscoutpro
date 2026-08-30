"use client";

export default function Hero() {
  return (
    <section className="w-full bg-white py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight">
          Grant Funding, Simplified.
        </h1>

        <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
          GrantScout Pro finds opportunities, writes winning narratives, and keeps your team aligned — all in one workspace.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/signup"
            className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Start Free Trial
          </a>

          <a
            href="#how-it-works"
            className="px-8 py-4 bg-gray-100 text-gray-800 rounded-xl text-lg font-semibold hover:bg-gray-200 transition"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}

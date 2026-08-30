"use client";

export default function FinalCTA() {
  return (
    <section className="py-24 bg-blue-600 text-white text-center">
      <h2 className="text-4xl font-bold">Ready to Win More Grants?</h2>
      <p className="mt-4 text-xl max-w-2xl mx-auto">
        GrantScout Pro gives your team the tools to write faster, collaborate better, and secure more funding.
      </p>

      <a
        href="/signup"
        className="mt-10 inline-block px-10 py-4 bg-white text-blue-700 rounded-xl text-lg font-semibold hover:bg-gray-100 transition"
      >
        Start Free Trial
      </a>
    </section>
  );
}

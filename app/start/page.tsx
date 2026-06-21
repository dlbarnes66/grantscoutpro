export default function StartFreeTrialPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
      <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Start Your 14‑Day Free Trial
        </h1>

        <p className="text-gray-600 mb-6">
          Get full access to GrantScout Pro — AI‑powered grant discovery,
          deadline tracking, alerts, and automated insights. No commitment.
          Cancel anytime.
        </p>

        <div className="border rounded-lg p-4 mb-6 bg-gray-100">
          <p className="text-lg font-semibold text-gray-900">
            GrantScout Pro — $19/month
          </p>
          <p className="text-gray-600">
            Free for 14 days, then billed monthly.
          </p>
        </div>

        <a
          href="#"
          className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Start Free Trial
        </a>

        <p className="text-xs text-gray-500 mt-4 text-center">
          No charge today. You can cancel anytime during your trial.
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-gray-50">
      <div className="max-w-lg w-full bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Pricing
        </h1>

        <p className="text-gray-600 mb-8 text-center">
          Simple, transparent pricing. Start your 14‑day free trial — no charge today.
        </p>

        <div className="border rounded-lg p-6 bg-gray-100 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Grant Engine Pro
          </h2>

          <p className="text-gray-700 text-lg mb-1">$19 / month</p>
          <p className="text-gray-600 mb-4">Free for 14 days, cancel anytime.</p>

          <ul className="text-gray-700 space-y-2 mb-6">
            <li>• AI‑powered grant search</li>
            <li>• Deadline tracking & alerts</li>
            <li>• Saved grants & recommendations</li>
            <li>• Automated insights</li>
            <li>• Unlimited searches</li>
          </ul>

          <a
            href="/start"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Start Free Trial
          </a>
        </div>

        <p className="text-xs text-gray-500 text-center">
          No credit card charged today. You can cancel anytime during your trial.
        </p>
      </div>
    </div>
  );
}

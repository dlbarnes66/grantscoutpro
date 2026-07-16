"use client";

import { useBilling } from "@/hooks/useBilling";
import { Loader2, CreditCard, Sparkles } from "lucide-react";

export default function BillingPage() {
  const { billing, loading, startCheckout, openPortal } = useBilling();

  if (loading || !billing) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading billing…
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center gap-3">
        <CreditCard className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">
          Billing & Subscription
        </h1>
      </div>

      {/* Trial Banner */}
      {billing.trialEndsAt && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <Sparkles className="w-5 h-5 text-yellow-600 inline-block mr-2" />
          Trial ends on{" "}
          <strong>{new Date(billing.trialEndsAt).toLocaleDateString()}</strong>
        </div>
      )}

      {/* Subscription Status */}
      <div className="p-6 bg-white border rounded-xl shadow-sm space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Subscription Status
        </h2>

        {billing.isPaid ? (
          <div className="text-green-700 font-medium">
            Active Subscription
          </div>
        ) : (
          <div className="text-red-600 font-medium">
            Free Plan (Upgrade Available)
          </div>
        )}

        <div className="flex gap-3 mt-4">
          {!billing.isPaid && (
            <button
              onClick={startCheckout}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Upgrade to Pro
            </button>
          )}

          {billing.isPaid && (
            <button
              onClick={openPortal}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

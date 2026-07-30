"use client";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-10">
      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Billing Center</h1>
        <p className="text-muted mt-1">
          View your subscription, usage, and payment history.
        </p>
      </div>

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}

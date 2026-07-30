"use client";

import React from "react";

type BillingPanelProps = {
  workspaceId: string;
};

export function BillingPanel({ workspaceId }: BillingPanelProps) {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Billing & Subscription</h2>
          <p className="text-sm text-gray-500">
            Manage your plan, invoices, and payment method for this workspace.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          Workspace: {workspaceId}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Current plan</h3>
          <p className="text-sm text-gray-600">
            You are currently on the <span className="font-semibold">Pro</span>{" "}
            plan. This includes federal, state, and foundation/philanthropic
            grants, plus AI analysis.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Payment method</h3>
          <p className="text-sm text-gray-600">
            Billing is handled via Stripe. To update your card or view invoices,
            use the billing portal.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Open billing portal
        </button>
        <button
          type="button"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Change plan
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Billing features are placeholder for now. Stripe integration can be
        wired to these actions later.
      </p>
    </div>
  );
}

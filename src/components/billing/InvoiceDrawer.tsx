"use client"

import { Invoice } from "./types";

export function InvoiceDrawer({
  invoice,
  onCloseAction
}: {
  invoice: Invoice;
  onCloseAction: () => void;
}) {
  return (
    <div className="fixed right-0 top-0 w-96 h-full bg-slate-900 border-l border-slate-800 p-6 space-y-4 shadow-xl">
      <button
        onClick={onCloseAction}
        className="text-slate-400 hover:text-slate-200 text-sm"
      >
        Close
      </button>

      <h2 className="text-sm font-semibold text-slate-100">
        Invoice Details
      </h2>

      <div className="space-y-2 text-sm text-slate-300">
        <div><strong>Invoice:</strong> {invoice.number}</div>
        <div><strong>Status:</strong> {invoice.status}</div>
        <div><strong>Amount:</strong> ${(invoice.amount_due / 100).toFixed(2)}</div>
        <div><strong>Date:</strong> {new Date(invoice.created * 1000).toLocaleString()}</div>
      </div>

      <button
        onClick={() => window.open(`/api/billing/invoices/${invoice.id}/pdf`)}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
      >
        Download PDF
      </button>
    </div>
  );
}

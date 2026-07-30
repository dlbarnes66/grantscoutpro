"use client";

import { Invoice } from "./types";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

export function InvoiceList({
  invoices,
  onSelect
}: {
  invoices: Invoice[];
  onSelect: (inv: Invoice) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <table className="w-full text-sm text-slate-300">
        <thead>
          <tr className="text-slate-400">
            <th className="text-left py-2">Invoice</th>
            <th className="text-left py-2">Amount</th>
            <th className="text-left py-2">Status</th>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-t border-slate-800">
              <td className="py-2">{inv.number}</td>
              <td className="py-2">${(inv.amount_due / 100).toFixed(2)}</td>
              <td className="py-2">
                <PaymentStatusBadge status={inv.status} />
              </td>
              <td className="py-2">
                {new Date(inv.created * 1000).toLocaleDateString()}
              </td>
              <td className="py-2">
                <button
                  onClick={() => onSelect(inv)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

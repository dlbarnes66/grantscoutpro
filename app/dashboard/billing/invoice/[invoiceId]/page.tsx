"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function InvoicePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);

  const load = async () => {
    const res = await fetch(`/api/billing/invoice/${id}`);
    const data = await res.json();
    setInvoice(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading invoice…
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center text-red-600 text-lg py-20">
        Invoice not found.
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
          <p className="text-muted mt-2">
            Invoice #{invoice.number} • {invoice.date}
          </p>
        </div>

        <Link href="/dashboard/billing" className="btn btn-secondary">
          Back to Billing
        </Link>
      </div>

      {/* Invoice Summary */}
      <div className="card">
        <h2 className="section-title">Summary</h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="font-semibold text-gray-900">Amount</p>
            <p className="text-2xl font-bold mt-1">${invoice.amount}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Status</p>
            <p
              className={`mt-1 font-bold ${
                invoice.status === "paid"
                  ? "text-green-600"
                  : invoice.status === "open"
                  ? "text-blue-600"
                  : "text-red-600"
              }`}
            >
              {invoice.status.toUpperCase()}
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Billing Period</p>
            <p className="text-gray-700 mt-1">{invoice.period}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-900">Payment Method</p>
            <p className="text-gray-700 mt-1">
              {invoice.payment.brand} ending in {invoice.payment.last4}
            </p>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="card">
        <h2 className="section-title">Line Items</h2>

        <div className="mt-6 space-y-4">
          {invoice.items.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b pb-4"
            >
              <div>
                <p className="font-semibold text-gray-900">{item.description}</p>
                <p className="text-muted text-sm mt-1">{item.quantity} × ${item.unitAmount}</p>
              </div>

              <p className="font-semibold text-gray-900">${item.total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Download */}
      <div className="card">
        <h2 className="section-title">Download</h2>

        <p className="text-gray-700 mt-4">
          You can download the official invoice PDF using the button below.
        </p>

        <button
          onClick={() => window.open(invoice.pdfUrl, "_blank")}
          className="btn btn-primary mt-6"
        >
          Download PDF
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 flex gap-4">
        <Link href="/dashboard/billing" className="btn btn-secondary">
          Back to Billing
        </Link>

        <Link href="/dashboard" className="btn btn-success">
          Dashboard Home
        </Link>
      </div>
    </div>
  );
}

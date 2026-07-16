"use client";

import { useEffect, useState } from "react";

interface BillingStatus {
  customerId: string | null;
  subscriptionId: string | null;
  trialEndsAt: string | null;
  isPaid: boolean;
}

export function useBilling() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);

    const res = await fetch("/api/billing/status");
    const data = await res.json();

    if (res.ok) {
      setBilling(data.billing);
    }

    setLoading(false);
  }

  async function startCheckout() {
    const res = await fetch("/api/billing/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  async function openPortal() {
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }

  useEffect(() => {
    load();
  }, []);

  return { billing, loading, startCheckout, openPortal };
}

"use client"

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import { Loader2 } from "lucide-react";

interface BillingStats {
  totalRevenue: number;
  activeSubscriptions: number;
  failedPayments: number;
  mrr: number;
}

export default function BillingCockpit() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<BillingStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/superadmin/billing");
        const data = await res.json();
        setStats(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <Card className="p-6 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-semibold">Billing Cockpit</h3>
        <p className="text-gray-500">No billing data available.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-xl font-semibold">Billing Cockpit</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold">${stats.totalRevenue}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Active Subscriptions</p>
          <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">Failed Payments</p>
          <p className="text-2xl font-bold">{stats.failedPayments}</p>
        </div>

        <div className="p-4 bg-gray-50 border rounded">
          <p className="text-sm text-gray-500">MRR</p>
          <p className="text-2xl font-bold">${stats.mrr}</p>
        </div>
      </div>
    </Card>
  );
}

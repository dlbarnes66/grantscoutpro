"use client";

import { useEffect, useState } from "react";
import { UsageSummary } from "@/components/billing/UsageSummary";
import { UsageBreakdown } from "@/components/billing/UsageBreakdown";
import { UsagePeriod } from "@/components/billing/UsagePeriod";
import { UsageOverages } from "@/components/billing/UsageOverages";

export default function UsagePage() {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const res = await fetch("/api/billing/usage");
      const data = await res.json();

      setUsage(data);
      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return <div className="text-slate-400">Loading usage...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Usage Metering
      </h1>

      <UsagePeriod period={usage.period} />

      <UsageSummary summary={usage.summary} />

      <UsageBreakdown items={usage.items} />

      <UsageOverages overages={usage.overages} />
    </div>
  );
}

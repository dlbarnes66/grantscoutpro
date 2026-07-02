"use client";

import { useEffect, useState } from "react";
import { MonitoringKPIs } from "@/components/monitoring/MonitoringKPIs";
import { MonitoringAlerts } from "@/components/monitoring/MonitoringAlerts";
import { MonitoringForecast } from "@/components/monitoring/MonitoringForecast";
import { ProgramHealthScore } from "@/components/monitoring/ProgramHealthScore";
import { AIMonitoringInsights } from "@/components/monitoring/AIMonitoringInsights";

export default function MonitoringDashboardPage({ params }: { params: { id: string } }) {
  const [monitorData, setMonitorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real AI integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setMonitorData({
        kpis: [
          { label: "Youth Served", current: 220, target: 300 },
          { label: "Workshops Delivered", current: 14, target: 20 },
          { label: "Volunteer Hours", current: 410, target: 500 },
          { label: "Community Events", current: 6, target: 10 }
        ],
        alerts: [
          { id: "1", type: "warning", message: "Workshop delivery pace below target" },
          { id: "2", type: "critical", message: "Outcome evidence overdue" }
        ],
        forecast: {
          projectedImpact: 88,
          projectedCompletion: "2026-12-20",
          notes: "Program is on track but requires increased workshop frequency."
        },
        health: 74,
        aiInsights:
          "Increasing workshop frequency by 15% over the next 60 days will significantly improve program health and reduce risk."
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading monitoring dashboard...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Monitoring & KPI Dashboard
      </h1>

      <MonitoringKPIs kpis={monitorData.kpis} />

      <MonitoringAlerts alerts={monitorData.alerts} />

      <MonitoringForecast forecast={monitorData.forecast} />

      <ProgramHealthScore score={monitorData.health} />

      <AIMonitoringInsights insights={monitorData.aiInsights} />
    </div>
  );
}

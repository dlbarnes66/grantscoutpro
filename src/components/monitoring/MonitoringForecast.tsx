"use client"

import { MonitoringForecastData } from "./types";

export default function MonitoringForecast({
  forecast
}: {
  forecast: MonitoringForecastData;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">Forecasting</h2>

      <div className="text-sm text-slate-300">
        <div className="font-semibold text-slate-100">Projected Impact:</div>
        <div className="text-blue-400 text-xl font-bold">
          {forecast.projectedImpact}%
        </div>
      </div>

      <div className="text-sm text-slate-300">
        <div className="font-semibold text-slate-100">Projected Completion:</div>
        <div>{forecast.projectedCompletion}</div>
      </div>

      <p className="text-sm text-slate-400">{forecast.notes}</p>
    </div>
  );
}

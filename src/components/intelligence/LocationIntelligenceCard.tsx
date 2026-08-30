"use client";

import React from "react";
import Card from "@/components/ui/Card";
import { WorkspaceLocation } from "@/types/workspace";

export default function LocationIntelligenceCard({
  location,
}: {
  location: WorkspaceLocation;
}) {
  return (
    <Card className="p-6 space-y-3">
      <h2 className="text-xl font-semibold">
        {location.name ?? "Location"}
      </h2>

      <div className="text-slate-300 space-y-1">
        {location.address && <p>{location.address}</p>}

        {(location.city || location.state) && (
          <p>
            {location.city ?? "Unknown City"},{" "}
            {location.state ?? "Unknown State"}
          </p>
        )}

        {location.zip && <p>ZIP: {location.zip}</p>}
        {location.county && <p>County: {location.county}</p>}
        {location.country && <p>Country: {location.country}</p>}
        {location.timezone && <p>Timezone: {location.timezone}</p>}
      </div>

      <div className="text-sm text-slate-400">
        Location ID: <span className="font-mono">{location.id}</span>
      </div>
    </Card>
  );
}

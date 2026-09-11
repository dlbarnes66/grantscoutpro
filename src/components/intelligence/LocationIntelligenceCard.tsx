"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import Card from "@/components/ui/Card";
import { WorkspaceLocation } from "@/types/workspace";

export default function LocationIntelligenceCard({
  location,
  onDelete,
}: {
  location: WorkspaceLocation;
  onDelete?: (id: string) => void;
}) {
  return (
    <Card className="p-6 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold">
          {location.name ?? location.city ?? "Location"}
        </h2>

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(location.id)}
            aria-label="Remove location"
            title="Remove location"
            className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

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

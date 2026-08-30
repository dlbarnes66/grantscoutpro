"use client"

import { useState } from "react";

export default function GrantScoreBreakdown({ breakdown }) {
  const [open, setOpen] = useState(false);

  if (!breakdown) return null;

  const intel = breakdown.intelligence;

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-blue-600 text-sm underline"
      >
        Why was this recommended?
      </button>

      {open && (
        <div className="mt-3 p-4 border rounded bg-gray-50 text-sm space-y-2">
          <div>
            <strong>Location Match:</strong> {breakdown.locationMatch}
          </div>
          <div>
            <strong>Deadline Urgency:</strong> {breakdown.deadlineUrgency}
          </div>
          <div>
            <strong>Funding Priority:</strong> {breakdown.fundingPriority}
          </div>
          <div>
            <strong>AI Scores:</strong> {breakdown.aiScores}
          </div>
          <div>
            <strong>Tier Access:</strong> {breakdown.tierAccess}
          </div>

          <hr />

          <div className="font-semibold">Location Intelligence</div>

          <div>Poverty Match: {intel.poverty}</div>
          <div>Income Match: {intel.income}</div>
          <div>Unemployment Match: {intel.unemployment}</div>
          <div>Rural/Urban Match: {intel.ruralUrban}</div>
          <div>Opportunity Zone: {intel.opportunityZone}</div>
          <div>Distressed Community: {intel.distressed}</div>
        </div>
      )}
    </div>
  );
}

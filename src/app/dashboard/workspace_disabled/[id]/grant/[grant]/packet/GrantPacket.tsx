"use client";

import { useState } from "react";

export default function GrantPacket({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [packet, setPacket] = useState<any>(null);

  async function generate() {
    setLoading(true);

    const res = await fetch("/api/grants/packet", {
      method: "POST",
      body: JSON.stringify({ grantId }),
    });

    const json = await res.json();
    setPacket(json.packet);
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <button
        onClick={generate}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {loading ? "Generating..." : "Generate Submission Packet"}
      </button>

      {packet && (
        <div className="space-y-8 mt-6">
          <div>
            <h2 className="text-xl font-semibold">Cover Letter</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {packet.coverLetter}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Compliance Checklist</h2>
            <ul className="list-disc ml-6">
              {packet.complianceChecklist.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Narrative</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {packet.narrative}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Budget Summary</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {packet.budgetText}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Attachments</h2>
            <ul className="space-y-4">
              {packet.attachments.map((a: any, i: number) => (
                <li key={i} className="p-3 border rounded-md bg-gray-50">
                  <p className="font-semibold">{a.name}</p>
                  <p className="text-sm text-gray-600">Tag: {a.tag}</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {a.summary}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

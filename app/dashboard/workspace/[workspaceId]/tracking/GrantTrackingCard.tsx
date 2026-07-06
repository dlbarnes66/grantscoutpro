"use client";

import { useState } from "react";

export default function GrantTrackingCard({
  grant
}: {
  grant: {
    id: string;
    title: string;
    summary: string;
    status: string;
    priority: string;
    notes: string;
    deadline?: string;
    statusHistory: string[];
  };
}) {
  const [status, setStatus] = useState(grant.status || "Not Started");
  const [priority, setPriority] = useState(grant.priority || "Medium");
  const [notes, setNotes] = useState(grant.notes || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);

    await fetch("/api/grants/status/update", {
      method: "POST",
      body: JSON.stringify({
        grantId: grant.id,
        status,
        notes,
        priority
      }),
    });

    setSaving(false);
  }

  return (
    <div className="p-4 border rounded-md bg-white shadow-sm space-y-4">
      <h2 className="text-xl font-semibold">{grant.title}</h2>

      <p className="text-gray-700 whitespace-pre-wrap">{grant.summary}</p>

      {grant.deadline && (
        <p className="text-sm text-red-600">
          <strong>Deadline:</strong> {grant.deadline}
        </p>
      )}

      <div className="space-y-2">
        <label className="font-medium">Status</label>
        <select
          className="p-2 border rounded-md w-full"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Not Started</option>
          <option>In Progress</option>
          <option>Drafting</option>
          <option>Reviewing</option>
          <option>Submitted</option>
          <option>Awarded</option>
          <option>Rejected</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Priority</label>
        <select
          className="p-2 border rounded-md w-full"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="font-medium">Notes</label>
        <textarea
          className="w-full p-2 border rounded-md h-24"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <div className="mt-4">
        <h3 className="font-semibold">Status History</h3>
        <ul className="list-disc ml-6 mt-2">
          {grant.statusHistory.map((entry, i) => (
            <li key={i}>{entry}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

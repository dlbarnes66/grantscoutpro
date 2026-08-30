"use client"

import React from "react";

export default function APILogViewer({
  logs = [],
}: {
  logs?: Array<{ id: string; timestamp: string; message: string }>;
}) {
  return (
    <div className="space-y-4 border p-4 rounded bg-gray-50">
      <h3 className="font-semibold text-lg">API Logs</h3>

      {logs.length === 0 && (
        <p className="text-sm text-gray-600">No logs available.</p>
      )}

      {logs.map((log) => (
        <div key={log.id} className="border p-3 rounded bg-white">
          <p className="font-medium">{log.timestamp}</p>
          <p className="text-sm">{log.message}</p>
        </div>
      ))}
    </div>
  );
}

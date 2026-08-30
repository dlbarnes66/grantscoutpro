"use client"

import React from "react";

export default function APIKeyViewer({
  apiKey = "••••••••••••••••••••",
}: {
  apiKey?: string;
}) {
  return (
    <div className="border p-4 rounded bg-gray-50 space-y-2">
      <h3 className="font-semibold text-lg">API Key</h3>
      <p className="font-mono text-sm p-2 bg-white border rounded">
        {apiKey}
      </p>
    </div>
  );
}

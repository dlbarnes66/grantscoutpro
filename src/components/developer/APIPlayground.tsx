"use client";

import React, { useState } from "react";

export default function APIPlayground() {
  const [endpoint, setEndpoint] = useState("/api/example");
  const [response, setResponse] = useState("");

  const callApi = async () => {
    try {
      const res = await fetch(endpoint);
      const text = await res.text();
      setResponse(text);
    } catch (error) {
      setResponse("Error calling API");
    }
  };

  return (
    <div className="space-y-4 rounded border bg-gray-50 p-4">
      <h3 className="text-lg font-semibold">
        API Playground
      </h3>

      <input
        className="w-full rounded border p-2"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        placeholder="/api/your-endpoint"
      />

      <button
        onClick={callApi}
        className="rounded bg-blue-600 px-4 py-2 text-white"
      >
        Send Request
      </button>

      <pre className="whitespace-pre-wrap rounded border bg-white p-3 text-sm">
        {response}
      </pre>
    </div>
  );
}
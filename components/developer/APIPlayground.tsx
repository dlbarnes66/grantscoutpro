"use client";

import { useState } from "react";

export function APIPlayground({ onLog }: { onLog: (entry: any) => void }) {
  const [method, setMethod] = useState("GET");
  const [endpoint, setEndpoint] = useState("/v1/grants");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<any>(null);

  async function sendRequest() {
    const fakeResponse = {
      status: 200,
      data: { message: "This is a mock API response." },
      timestamp: new Date().toISOString()
    };

    setResponse(fakeResponse);
    onLog({
      method,
      endpoint,
      body,
      response: fakeResponse,
      timestamp: fakeResponse.timestamp
    });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
      <h2 className="text-sm font-semibold text-slate-100">
        API Playground
      </h2>

      <div className="space-y-3">
        <label className="text-xs text-slate-400">Method</label>
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-xs text-slate-400">Endpoint</label>
        <input
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs text-slate-400">Body (JSON)</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full h-32 rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
        />
      </div>

      <button
        onClick={sendRequest}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
      >
        Send Request
      </button>

      {response && (
        <div className="rounded-lg bg-slate-800 p-4 text-sm text-slate-300">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

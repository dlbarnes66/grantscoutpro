"use client"

import React from "react";

export function AssetReporting({
  assets = [],
}: {
  assets?: Array<{ id: string; name: string; status: string }>;
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Asset Reporting</h3>

      {assets.map((asset) => (
        <div key={asset.id} className="border p-3 rounded">
          <p className="font-medium">{asset.name}</p>
          <p className="text-sm text-gray-600">Status: {asset.status}</p>
        </div>
      ))}
    </div>
  );
}

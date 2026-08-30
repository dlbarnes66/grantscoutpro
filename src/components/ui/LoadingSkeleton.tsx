"use client"

import React from "react";

export default function LoadingSkeleton({
  lines = 3,
}: {
  lines?: number;
}) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-gray-300 rounded w-full" />
      ))}
    </div>
  );
}

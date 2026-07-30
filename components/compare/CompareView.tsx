"use client";

import React from "react";

export interface CompareViewProps {
  grantId: string;
  workspaceId: string;
  userId: string;
}

export default function CompareView({
  grantId,
  workspaceId,
  userId,
}: CompareViewProps) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Grant Comparison</h1>

      <div className="space-y-2">
        <p><strong>Grant ID:</strong> {grantId}</p>
        <p><strong>Workspace ID:</strong> {workspaceId}</p>
        <p><strong>User ID:</strong> {userId}</p>
      </div>

      <div className="mt-6 p-4 border rounded bg-white">
        <p>This is your CompareView component. Replace this with your actual comparison UI.</p>
      </div>
    </div>
  );
}

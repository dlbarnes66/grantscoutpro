"use client";

import { WorkspaceActivity } from "../types";
import { getActivityIcon } from "./icons";

export default function ActivityItem({ item }: { item: WorkspaceActivity }) {
  const Icon = getActivityIcon(item.type);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex gap-4">
      <div className="flex-shrink-0">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>

      <div className="flex-1 space-y-1">
        <p className="font-semibold text-gray-900">{item.type}</p>

        <p className="text-sm text-gray-700">
          {new Date(item.createdAt).toLocaleString()}
        </p>

        {item.metadata && (
          <pre className="text-xs text-gray-700 bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(item.metadata, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

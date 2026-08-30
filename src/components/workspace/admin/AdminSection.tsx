"use client"

import { AdminSectionData } from "../types";

export default function AdminSection({
  title,
  data,
}: {
  title: string;
  data: AdminSectionData;
}) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm space-y-4">
      <h2 className="text-xl font-bold">{title}</h2>

      <pre className="text-sm bg-gray-100 p-4 rounded">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

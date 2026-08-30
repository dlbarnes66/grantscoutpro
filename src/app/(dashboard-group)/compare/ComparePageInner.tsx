"use client"

import { useSearchParams } from "next/navigation";

export default function ComparePageInner() {
  const params = useSearchParams();
  const grantId = params.get("grantId");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Compare Grant</h1>
      <p>Grant ID: {grantId}</p>
    </div>
  );
}

"use client"

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useEffect, useState } from "react";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard/overview");
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <pre className="mt-4">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

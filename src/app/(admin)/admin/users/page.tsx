"use client"

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }
        const json = await res.json();
        setUsers(json);
      } catch (err) {
        console.error("Failed to load users:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Admin Users</h1>
      <pre className="mt-4">{JSON.stringify(users, null, 2)}</pre>
    </div>
  );
}

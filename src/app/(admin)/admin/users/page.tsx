"use client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      setUsers(json);
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

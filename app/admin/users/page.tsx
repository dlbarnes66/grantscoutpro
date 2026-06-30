"use client";

import { useEffect, useState } from "react";
import { UsersTable } from "@/components/admin/UsersTable";
import { RoleEditor } from "@/components/admin/RoleEditor";
import { InviteUserPanel } from "@/components/admin/InviteUserPanel";
import { UserStatusPanel } from "@/components/admin/UserStatusPanel";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real backend integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setUsers([
        {
          id: "1",
          name: "Darryl Barnes",
          email: "darryl@example.com",
          role: "Owner",
          status: "active",
          lastActive: "2026-06-30 11:45"
        },
        {
          id: "2",
          name: "Alex Johnson",
          email: "alex@example.com",
          role: "Editor",
          status: "active",
          lastActive: "2026-06-30 11:20"
        },
        {
          id: "3",
          name: "Maria Lopez",
          email: "maria@example.com",
          role: "Reviewer",
          status: "suspended",
          lastActive: "2026-06-29 16:10"
        }
      ]);

      setLoading(false);
    }

    load();
  }, []);

  if (loading)
    return <div className="text-slate-400">Loading users...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        User Management
      </h1>

      <UsersTable
        users={users}
        onSelect={setSelectedUser}
        onUpdate={setUsers}
      />

      <InviteUserPanel onInvite={(newUser) => setUsers([...users, newUser])} />

      {selectedUser && (
        <RoleEditor
          user={selectedUser}
          onUpdate={(updatedUser) =>
            setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
          }
        />
      )}

      {selectedUser && (
        <UserStatusPanel
          user={selectedUser}
          onUpdate={(updatedUser) =>
            setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
          }
        />
      )}
    </div>
  );
}

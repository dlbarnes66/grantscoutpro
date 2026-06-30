"use client";

export function UsersTable({
  users,
  onSelect,
  onUpdate
}: {
  users: any[];
  onSelect: (u: any) => void;
  onUpdate: (u: any[]) => void;
}) {
  function removeUser(id: string) {
    onUpdate(users.filter((u) => u.id !== id));
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-sm font-semibold text-slate-100 mb-4">
        Users
      </h2>

      <table className="w-full text-sm text-slate-300">
        <thead>
          <tr className="text-slate-400">
            <th className="text-left py-2">Name</th>
            <th className="text-left py-2">Email</th>
            <th className="text-left py-2">Role</th>
            <th className="text-left py-2">Status</th>
            <th className="text-left py-2">Last Active</th>
            <th className="text-left py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-slate-800">
              <td className="py-2">{u.name}</td>
              <td className="py-2">{u.email}</td>
              <td className="py-2">{u.role}</td>
              <td className="py-2">{u.status}</td>
              <td className="py-2">{u.lastActive}</td>
              <td className="py-2 flex gap-3">
                <button
                  onClick={() => onSelect(u)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Manage
                </button>

                <button
                  onClick={() => removeUser(u.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

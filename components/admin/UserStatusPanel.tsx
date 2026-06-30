"use client";

export function UserStatusPanel({
  user,
  onUpdate
}: {
  user: any;
  onUpdate: (u: any) => void;
}) {
  function suspend() {
    onUpdate({ ...user, status: "suspended" });
  }

  function activate() {
    onUpdate({ ...user, status: "active" });
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        User Status — {user.name}
      </h2>

      <div className="text-sm text-slate-300">
        Current Status:{" "}
        <span className="font-semibold text-blue-400">{user.status}</span>
      </div>

      <div className="text-xs text-slate-400">
        Last Active: {user.lastActive}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={activate}
          className="rounded-md bg-green-600 hover:bg-green-700 transition px-3 py-2 text-sm font-medium"
        >
          Activate
        </button>

        <button
          onClick={suspend}
          className="rounded-md bg-red-600 hover:bg-red-700 transition px-3 py-2 text-sm font-medium"
        >
          Suspend
        </button>
      </div>
    </div>
  );
}

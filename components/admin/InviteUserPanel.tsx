"use client";

import { useState } from "react";

export function InviteUserPanel({
  onInvite
}: {
  onInvite: (u: any) => void;
}) {
  const [email, setEmail] = useState("");

  function invite() {
    if (!email) return;

    const newUser = {
      id: crypto.randomUUID(),
      name: email.split("@")[0],
      email,
      role: "Viewer",
      status: "invited",
      lastActive: "Never"
    };

    onInvite(newUser);
    setEmail("");
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-100">
        Invite User
      </h2>

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="w-full rounded-md bg-slate-800 border border-slate-700 px-3 py-2 text-sm"
      />

      <button
        onClick={invite}
        className="rounded-md bg-blue-600 hover:bg-blue-700 transition px-3 py-2 text-sm font-medium"
      >
        Send Invite
      </button>
    </div>
  );
}

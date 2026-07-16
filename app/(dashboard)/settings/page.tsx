"use client";

import { useWorkspaceSettings } from "@/hooks/useWorkspaceSettings";
import { Settings, Users, CreditCard, Shield, Trash2, MailPlus } from "lucide-react";
import { useState } from "react";

export default function WorkspaceSettingsPage() {
  const { workspace, loading, error, updateName, invite } = useWorkspaceSettings();

  const [name, setName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  if (loading) {
    return <div className="p-6 text-gray-600">Loading workspace settings…</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!workspace) {
    return <div className="p-6 text-gray-600">Workspace not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-7 h-7 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Workspace Settings</h1>
      </div>

      {/* Workspace Name */}
      <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Workspace Name</h2>

        <input
          type="text"
          defaultValue={workspace.name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 border rounded-lg w-full"
        />

        <button
          onClick={() => updateName(name)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Name
        </button>
      </div>

      {/* Members */}
      <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Members</h2>
        </div>

        <div className="space-y-3">
          {workspace.members.map((m) => (
            <div
              key={m.id}
              className="p-4 border rounded-lg bg-gray-50 flex justify-between"
            >
              <div>
                <div className="font-semibold">{m.email}</div>
              </div>

              <div className="text-gray-800 font-medium">{m.role}</div>
            </div>
          ))}
        </div>

        {/* Invite Member */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invite Member</h3>

          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="p-3 border rounded-lg flex-1"
            />

            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="p-3 border rounded-lg"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>

            <button
              onClick={() => invite(inviteEmail, inviteRole)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <MailPlus className="w-4 h-4" />
              Invite
            </button>
          </div>
        </div>
      </div>

      {/* Trial */}
      <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Trial Status</h2>
        </div>

        <div className="text-gray-700">
          Trial Ends:{" "}
          {workspace.trialEndsAt
            ? new Date(workspace.trialEndsAt).toLocaleDateString()
            : "No trial"}
        </div>
      </div>

      {/* Billing */}
      <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Billing</h2>
        </div>

        <a
          href="/billing"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
        >
          Open Billing Portal
        </a>
      </div>

      {/* Danger Zone */}
      <div className="p-6 bg-red-50 border border-red-300 rounded-xl shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold text-red-700">Danger Zone</h2>
        </div>

        <p className="text-red-700">
          Deleting your workspace will permanently remove all grants, documents, members, and history.
        </p>

        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
          Delete Workspace
        </button>
      </div>
    </div>
  );
}

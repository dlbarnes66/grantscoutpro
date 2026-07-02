"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function TeamMemberPage() {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      const res = await fetch(`/api/team/${id}`);
      const data = await res.json();
      setMember(data);
      setRole(data.role || "member");
      setLoading(false);
    };

    loadMember();
  }, [id]);

  const saveRole = async () => {
    setSaving(true);

    await fetch(`/api/team/${id}/role`, {
      method: "POST",
      body: JSON.stringify({ role }),
    });

    setSaving(false);
    alert("Role updated!");
  };

  const removeMember = async () => {
    if (!confirm("Remove this team member?")) return;

    await fetch(`/api/team/${id}/remove`, {
      method: "POST",
    });

    window.location.href = "/dashboard/team";
  };

  if (loading) {
    return (
      <div className="text-center text-muted text-lg py-20">
        Loading team member…
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center text-red-600 text-lg py-20">
        Team member not found.
      </div>
    );
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Team Member</h1>
        <p className="text-muted mt-2">
          Update roles, permissions, or remove this member from your team.
        </p>
      </div>

      {/* Member Info */}
      <div className="card">
        <h2 className="section-title">Member Information</h2>

        <div className="mt-4 space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Name:</span> {member.name}
          </p>
          <p>
            <span className="font-semibold">Email:</span> {member.email}
          </p>
          <p>
            <span className="font-semibold">Joined:</span>{" "}
            {new Date(member.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Role Management */}
      <div className="card">
        <h2 className="section-title">Role & Permissions</h2>

        <p className="text-muted mt-2">
          Choose the appropriate role for this team member.
        </p>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input mt-4 w-full"
        >
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>

        <button
          onClick={saveRole}
          disabled={saving}
          className="btn btn-primary mt-6"
        >
          {saving ? "Saving…" : "Save Role"}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-300">
        <h2 className="section-title text-red-600">Danger Zone</h2>

        <p className="text-muted mt-2">
          Removing this member will revoke all access immediately.
        </p>

        <button onClick={removeMember} className="btn btn-danger mt-6">
          Remove Member
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 flex gap-4">
        <Link href="/dashboard/team" className="btn btn-secondary">
          Back to Team
        </Link>

        <Link href="/dashboard" className="btn btn-success">
          Dashboard Home
        </Link>
      </div>
    </div>
  );
}

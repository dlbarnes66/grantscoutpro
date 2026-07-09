"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function WorkspaceSettingsPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`);
      const json = await res.json();
      setMembers(json.members || []);
      setLoading(false);
    };

    loadMembers();
  }, [workspaceId]);

  const invite = async () => {
    const res = await fetch(`/api/workspaces/${workspaceId}/invite`, {
      method: "POST",
      body: JSON.stringify({ email: inviteEmail }),
    });

    const json = await res.json();

    if (res.ok) {
      setMembers((prev) => [...prev, json.member]);
      setInviteEmail("");
    }
  };

  const removeMember = async (memberId: string) => {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/members/${memberId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Workspace Settings</h1>

      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Invite Member</h2>

        <Input
          placeholder="Email address"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />

        <Button onClick={invite}>Send Invite</Button>
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Team Members</h2>

        {loading && <p className="text-gray-600">Loading...</p>}

        {!loading && members.length === 0 && (
          <p className="text-gray-600">No members yet.</p>
        )}

        <div className="space-y-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p className="font-semibold">{m.user.email}</p>
                <p className="text-sm text-gray-600">{m.role}</p>
              </div>

              <Button variant="destructive" onClick={() => removeMember(m.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

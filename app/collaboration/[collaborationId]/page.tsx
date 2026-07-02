"use client";

import { useEffect, useState } from "react";
import { TeamMembers } from "@/components/collaboration/TeamMembers";
import { RoleManager } from "@/components/collaboration/RoleManager";
import { CommentsPanel } from "@/components/collaboration/CommentsPanel";
import { MentionsPanel } from "@/components/collaboration/MentionsPanel";
import { ActivityTimeline } from "@/components/collaboration/ActivityTimeline";

export default function CollaborationWorkspacePage({ params }: { params: { id: string } }) {
  const [collabData, setCollabData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // Placeholder — real backend integration comes later
      await new Promise((r) => setTimeout(r, 600));

      setCollabData({
        members: [
          { id: "1", name: "Darryl Barnes", role: "Owner" },
          { id: "2", name: "Alex Johnson", role: "Editor" },
          { id: "3", name: "Maria Lopez", role: "Reviewer" }
        ],
        comments: [
          {
            id: "c1",
            author: "Alex Johnson",
            text: "We should strengthen the evaluation section.",
            timestamp: "2026-06-30 10:12"
          },
          {
            id: "c2",
            author: "Maria Lopez",
            text: "Budget justification looks solid.",
            timestamp: "2026-06-30 10:20"
          }
        ],
        mentions: [
          {
            id: "m1",
            from: "Alex Johnson",
            to: "Darryl Barnes",
            text: "Can you review the narrative intro?",
            timestamp: "2026-06-30 10:25"
          }
        ],
        activity: [
          { id: "a1", text: "Darryl updated the narrative", timestamp: "2026-06-30 09:45" },
          { id: "a2", text: "Maria added a comment", timestamp: "2026-06-30 10:20" },
          { id: "a3", text: "Alex mentioned Darryl", timestamp: "2026-06-30 10:25" }
        ]
      });

      setLoading(false);
    }

    load();
  }, [params.id]);

  if (loading)
    return <div className="text-slate-400">Loading collaboration workspace...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-slate-100">
        Team Collaboration
      </h1>

      <TeamMembers members={collabData.members} />

      <RoleManager members={collabData.members} />

      <CommentsPanel comments={collabData.comments} />

      <MentionsPanel mentions={collabData.mentions} />

      <ActivityTimeline activity={collabData.activity} />
    </div>
  );
}

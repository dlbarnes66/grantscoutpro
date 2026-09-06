// src/app/(workspace-group)/workspace/[workspaceId]/chat/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useRagChat } from "@/hooks/useRagChat";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Textarea from "@/components/ui/Textarea";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspaceChatPage({ params }: { params: { workspaceId: string } }) {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const [message, setMessage] = useState("");

  const { messages, loading, sendMessage } = useRagChat(workspaceId);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <WorkspaceShell title="AI Workspace Chat" workspaceId={workspaceId}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-[400px] border rounded-md p-4 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <Card key={idx} className="p-4">
              <p className="font-semibold">{msg.role === "user" ? "You" : "AI"}</p>
              <p className="text-gray-300 whitespace-pre-wrap">{msg.content}</p>
            </Card>
          ))}

          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </div>

        <Textarea
          placeholder="Ask about your workspace documents..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div
          onClick={handleSend}
          className="cursor-pointer p-3 text-center bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Send
        </div>
      </div>
    </WorkspaceShell>
  );
}

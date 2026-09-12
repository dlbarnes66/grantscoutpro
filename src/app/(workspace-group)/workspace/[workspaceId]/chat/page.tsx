// src/app/(workspace-group)/workspace/[workspaceId]/chat/page.tsx
"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useRagChat } from "@/hooks/useRagChat";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Textarea from "@/components/ui/Textarea";
import WorkspaceShell from "@/components/workspace/WorkspaceShell";

export default function WorkspaceChatPage() {
  const routeParams = useParams();
  const workspaceId = routeParams.workspaceId as string;
  const [message, setMessage] = useState("");

  const { messages, loading, sendMessage } = useRagChat(workspaceId);

  const handleSend = () => {
    if (!message.trim() || loading) return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <WorkspaceShell title="AI Workspace Chat" workspaceId={workspaceId}>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="h-[400px] border rounded-md p-4 overflow-y-auto space-y-4">
          {messages.length === 0 && !loading && (
            <p className="text-sm text-gray-500">
              Ask a question about the documents in this workspace.
            </p>
          )}

          {messages.map((msg, idx) => (
            <Card key={idx} className="p-4">
              <p className="font-semibold">{msg.role === "user" ? "You" : "AI"}</p>
              <p className="text-gray-300 whitespace-pre-wrap">{msg.content}</p>
              {!!msg.sources?.length && (
                <p className="mt-2 text-xs text-gray-500">
                  Sources: {msg.sources.map((s) => s.title).join(", ")}
                </p>
              )}
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
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <div
          onClick={handleSend}
          className={`p-3 text-center font-semibold rounded-md transition ${
            loading
              ? "bg-blue-600/50 text-white/70 cursor-not-allowed"
              : "cursor-pointer bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Thinking..." : "Send"}
        </div>
      </div>
    </WorkspaceShell>
  );
}

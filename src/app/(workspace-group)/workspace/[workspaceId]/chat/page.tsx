"use client";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { useState } from "react";
import { useRagChat } from "@/hooks/useRagChat";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import Textarea from "@/components/ui/Textarea";

export default function WorkspaceChatPage({ params }: { params: { workspaceId: string } }) {
  const [message, setMessage] = useState("");
  const { messages, loading, sendMessage } = useRagChat(workspaceId);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Workspace Chat</h1>

      <div className="h-[400px] border rounded-md p-4 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <Card key={idx} className="p-4">
            <p className="font-semibold">{msg.role === "user" ? "You" : "AI"}</p>
            <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
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
  );
}

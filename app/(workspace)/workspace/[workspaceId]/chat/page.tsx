"use client";

import { useState } from "react";
import { useRagChat } from "@/hooks/useRagChat";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspaceChatPage({ params }: { params: { workspaceId: string } }) {
  const [message, setMessage] = useState("");
  const { history, isLoading, sendMessage } = useRagChat(params.workspaceId);

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage(message);
    setMessage("");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Workspace Chat</h1>

      <ScrollArea className="h-[400px] border rounded-md p-4">
        <div className="space-y-4">
          {history.map((msg, idx) => (
            <Card key={idx} className="p-4">
              <p className="font-semibold">{msg.role === "user" ? "You" : "AI"}</p>
              <p className="text-gray-700">{msg.content}</p>
            </Card>
          ))}

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Input
          placeholder="Ask about your workspace documents..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  );
}

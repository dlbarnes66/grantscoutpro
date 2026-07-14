"use client";

import { useEffect, useState } from "react";
import { useDocumentAI } from "@/hooks/useDocumentAI";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentViewerPage({
  params,
}: {
  params: { workspaceId: string; documentId: string };
}) {
  const { workspaceId, documentId } = params;

  const [content, setContent] = useState<string | null>(null);
  const { result, isLoading, runTool } = useDocumentAI(workspaceId, documentId);

  useEffect(() => {
    const loadDoc = async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/documents/${documentId}`);
      const json = await res.json();
      setContent(json.content);
    };
    loadDoc();
  }, [workspaceId, documentId]);

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      <Card className="col-span-2 p-4">
        <h1 className="text-xl font-bold mb-4">Document Viewer</h1>

        {!content && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {content && (
          <ScrollArea className="h-[600px] border rounded-md p-4">
            <pre className="whitespace-pre-wrap text-gray-800">{content}</pre>
          </ScrollArea>
        )}
      </Card>

      <Card className="p-4 space-y-4">
        <h2 className="text-lg font-semibold">AI Tools</h2>

        <Button onClick={() => runTool("summarize")}>Summarize</Button>
        <Button onClick={() => runTool("explain")}>Explain</Button>
        <Button onClick={() => runTool("rewrite")}>Rewrite</Button>
        <Button onClick={() => runTool("requirements")}>Extract Requirements</Button>

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {!isLoading && result && (
          <Card className="p-4">
            <h3 className="font-semibold mb-2">AI Output</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{result}</p>
          </Card>
        )}
      </Card>
    </div>
  );
}

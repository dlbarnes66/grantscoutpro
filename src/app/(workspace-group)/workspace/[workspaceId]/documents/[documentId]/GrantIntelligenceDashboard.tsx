"use client";

import { useEffect, useState } from "react";
import DocumentIntelligence from "./DocumentIntelligence";

interface Props {
  workspaceId: string;
  documentId: string;
  userId: string;
}

export default function GrantIntelligenceDashboard({
  workspaceId,
  documentId,
  userId,
}: Props) {
  const [content, setContent] = useState("");
  const [profile, setProfile] = useState<any>({});
  const [cursorContext, setCursorContext] = useState("");

  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/documents/${documentId}/viewer`
        );

        if (!res.ok) {

          throw new Error(`Request failed (${res.status})`);

        }

        const data = await res.json();

        setContent(data.content || "");
      } catch (err) {
        console.error(
          "Failed to load document content:",
          err
        );
      }
    }

    loadContent();
  }, [workspaceId, documentId]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(
          `/api/workspaces/${workspaceId}/profile`
        );

        if (!res.ok) {

          throw new Error(`Request failed (${res.status})`);

        }

        const data = await res.json();

        setProfile(data.profile || {});
      } catch (err) {
        console.error(
          "Failed to load profile:",
          err
        );
      }
    }

    loadProfile();
  }, [workspaceId]);

  function handleCursorChange(
    context: string
  ) {
    setCursorContext(context);
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Grant Intelligence Dashboard
          </h1>

          <p className="text-sm text-slate-400">
            Workspace {workspaceId} • Document {documentId}
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <DocumentIntelligence
          workspaceId={workspaceId}
          documentId={documentId}
          userId={userId}
          content={content}
          profile={profile}
          cursorContext={cursorContext}
        />
      </div>
    </div>
  );
}
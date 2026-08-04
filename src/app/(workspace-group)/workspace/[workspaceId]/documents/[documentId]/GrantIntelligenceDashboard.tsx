"use client";

import { useState, useEffect } from "react";
import DocumentIntelligence from "./DocumentIntelligence";

export default function GrantIntelligenceDashboard({
  workspaceId,
  documentId,
  userId
}) {
  const [content, setContent] = useState("");
  const [profile, setProfile] = useState(null);
  const [cursorContext, setCursorContext] = useState("");

  // Load document content
  useEffect(() => {
    async function loadContent() {
      try {
        const res = await fetch(
          `/api/workspace/${workspaceId}/documents/${documentId}/viewer`
        );
        const data = await res.json();
        setContent(data.content || "");
      } catch (err) {
        console.error("Failed to load document content:", err);
      }
    }

    loadContent();
  }, [workspaceId, documentId]);

  // Load organization profile (for funder matching)
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/workspace/${workspaceId}/profile`);
        const data = await res.json();
        setProfile(data.profile || {});
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    loadProfile();
  }, [workspaceId]);

  // Capture cursor context (for inline AI suggestions)
  function handleCursorChange(context) {
    setCursorContext(context);
  }

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Grant Intelligence Dashboard</h1>
          <p className="text-sm text-gray-600">
            Workspace {workspaceId} • Document {documentId}
          </p>
        </div>
      </div>

      {/* Main Intelligence System */}
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
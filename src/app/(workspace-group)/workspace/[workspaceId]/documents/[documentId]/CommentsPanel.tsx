"use client"

import { useEffect, useState } from "react";

export default function CommentsPanel({ workspaceId, documentId, userId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  async function fetchComments() {
    try {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/comments`
      );
      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }
      const data = await res.json();
      setComments(data.comments || []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addComment() {
    if (!text.trim()) return;

    try {
      await fetch(
        `/api/workspaces/${workspaceId}/documents/${documentId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            text,
            selection: null
          })
        }
      );

      setText("");
      fetchComments();
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  }

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="w-80 h-full border-l bg-white p-4 flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Comments</h2>

      {loading ? (
        <div className="text-gray-500">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-gray-500">No comments yet.</div>
      ) : (
        <div className="space-y-4 overflow-y-auto flex-1">
          {comments.map((c) => (
            <div
              key={c.id}
              className="border rounded-md p-3 bg-gray-50 space-y-1"
            >
              <div className="text-sm font-medium">User {c.userId}</div>
              <div className="text-sm">{c.text}</div>
              <div className="text-xs text-gray-500">
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border rounded-md p-2 text-sm"
          placeholder="Add a comment..."
        />

        <button
          onClick={addComment}
          className="mt-2 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Add Comment
        </button>
      </div>
    </div>
  );
}

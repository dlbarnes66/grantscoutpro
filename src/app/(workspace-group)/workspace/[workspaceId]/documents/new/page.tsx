"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function NewDocumentPage() {
  const [title, setTitle] = useState("");

  const params = useParams();
  const workspaceId = params.workspaceId as string;

  async function createDocument() {
    const payload = {
      title,
    };

    alert(
      "SENDING:\n" +
      JSON.stringify(payload, null, 2)
    );

    console.log("PAYLOAD", payload);

    const res = await fetch(
      `/api/workspaces/${workspaceId}/documents/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Create Document</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div>
        Current Title: {title}
      </div>

      <button onClick={createDocument}>
        Create Document
      </button>
    </div>
  );
}
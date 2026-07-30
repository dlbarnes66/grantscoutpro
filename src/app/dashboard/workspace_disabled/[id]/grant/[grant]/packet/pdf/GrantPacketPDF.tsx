"use client";

import { useState } from "react";

export default function GrantPacketPDF({
  workspaceId,
  grantId
}: {
  workspaceId: string;
  grantId: string;
}) {
  const [loading, setLoading] = useState(false);

  async function exportPDF() {
    setLoading(true);

    const response = await fetch("/api/grants/packet/pdf", {
      method: "POST",
      body: JSON.stringify({ grantId: grantId })
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "grant_packet_" + grantId + ".pdf";
    link.click();

    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white shadow-sm">
      <button
        onClick={exportPDF}
        disabled={loading}
        className="px-4 py-2 bg-purple-600 text-white rounded-md"
      >
        {loading ? "Generating PDF..." : "Download PDF Packet"}
      </button>
    </div>
  );
}

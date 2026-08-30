"use client"
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";




export default function PresenceBar() {
  return (
    <div className="w-full p-2 bg-gray-100 text-gray-600 text-sm">
      Presence tracking disabled in this version.
    </div>
  );
}

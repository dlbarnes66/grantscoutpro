"use client";

import Link from "next/link";

export default function WorkspaceLockedPage({
  params
}: {
  params: { workspaceId: string };
}) {
  const { workspaceId } = params;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white shadow-lg rounded-lg p-10 max-w-lg text-center border border-gray-200">
        <h1 className="text-3xl font-bold mb-4 text-red-600">
          Workspace Locked
        </h1>

        <p className="text-gray-700 mb-6">
          Your trial has ended or your subscription is inactive.  
          To continue using GrantScout Pro, please update your billing plan.
        </p>

        <Link
          href={`/dashboard/workspace/${workspaceId}/billing`}
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Go to Billing
        </Link>

        <p className="text-gray-500 text-sm mt-6">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}

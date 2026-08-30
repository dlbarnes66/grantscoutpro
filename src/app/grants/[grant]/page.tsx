"use client"
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

type Props = {
  params: { grant: string };
};

export default async function GrantPage({ params }: Props) {
  const grant = await prisma.grant.findUnique({
    where: { id: params.grant },
  });

  if (!grant) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Grant not found</h1>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{grant.title}</h1>

      {grant.summary && (
        <p className="text-gray-300">{grant.summary}</p>
      )}

      <div className="space-y-2 text-sm text-gray-400">
        {grant.amount && (
          <p>Amount: ${grant.amount.toLocaleString()}</p>
        )}

        {grant.deadline && (
          <p>Deadline: {grant.deadline.toLocaleDateString()}</p>
        )}

        {grant.location && <p>Location: {grant.location}</p>}

        {grant.foundationName && (
          <p>Funder: {grant.foundationName}</p>
        )}
      </div>
    </div>
  );
}

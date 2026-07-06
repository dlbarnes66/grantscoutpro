// app/dashboard/federal-grants/[grantId]/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  generateAISummary,
  generateGrantScores,
} from "./actions";

export default async function GrantDetailPage({ params }) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/");

  const grant = await prisma.grant.findUnique({
    where: { id: params.grantId },
  });

  if (!grant) redirect("/dashboard/federal-grants");

  // ⭐ Server Action Wrapper — MUST return void
  async function handleGenerateSummary() {
    "use server";
    await generateAISummary(grant.id, "AI summary placeholder");
  }

  async function handleGenerateScores() {
    "use server";
    await generateGrantScores(grant.id, { score: 92 });
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{grant.title}</h1>

      <pre className="p-4 bg-gray-100 rounded">
        {JSON.stringify(grant.raw, null, 2)}
      </pre>

      <form action={handleGenerateSummary}>
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded">
          Generate AI Summary
        </button>
      </form>

      <form action={handleGenerateScores}>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
          Generate AI Scores
        </button>
      </form>
    </div>
  );
}

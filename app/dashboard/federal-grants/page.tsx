import prisma from "@/lib/prisma";
import Filters from "./components/Filters";

export default async function FederalGrantsPage({ searchParams }) {
  const q = searchParams.q ?? "";
  const agency = searchParams.agency ?? "";
  const category = searchParams.category ?? "";

  // Fetch unique agencies & categories for filter dropdowns
  const agencies = await prisma.federalGrant.findMany({
    select: { agency: true },
    distinct: ["agency"],
    where: { agency: { not: null } },
  });

  const categories = await prisma.federalGrant.findMany({
    select: { category: true },
    distinct: ["category"],
    where: { category: { not: null } },
  });

  // Main filtered query
  const grants = await prisma.federalGrant.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        agency ? { agency } : {},
        category ? { category } : {},
      ],
    },
    orderBy: { deadline: "asc" },
    take: 200,
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Federal Grants</h1>

      <Filters
        agencies={agencies.map((a) => a.agency)}
        categories={categories.map((c) => c.category)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {grants.map((g) => (
          <a
            key={g.id}
            href={`/dashboard/federal-grants/${g.id}`}
            className="p-4 border rounded-lg bg-white hover:shadow transition"
          >
            <h2 className="text-lg font-semibold">{g.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-3">{g.summary}</p>

            <div className="mt-3 text-sm">
              <div><strong>Agency:</strong> {g.agency ?? "—"}</div>
              <div><strong>Deadline:</strong> {g.deadline?.toISOString().split("T")[0] ?? "—"}</div>
              <div><strong>Amount:</strong> {g.amount ? `$${g.amount.toLocaleString()}` : "—"}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

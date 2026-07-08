import prisma from "@/lib/prisma";

export default async function AnalyticsPage() {
  // Basic counts
  const totalComparisons = await prisma.grantComparison.count();
  const totalComments = await prisma.comparisonComment.count();
  const totalActivities = await prisma.comparisonActivity.count();

  // Grants per comparison
  const comparisons = await prisma.grantComparison.findMany({
    select: { id: true, grantIds: true, name: true, createdAt: true },
  });

  const totalGrantsCompared = comparisons.reduce(
    (sum, c) => sum + c.grantIds.length,
    0
  );

  const avgGrantsPerComparison =
    comparisons.length > 0
      ? (totalGrantsCompared / comparisons.length).toFixed(1)
      : 0;

  // Most active comparisons (by activity count)
  const mostActive = await prisma.comparisonActivity.groupBy({
    by: ["comparisonId"],
    _count: { comparisonId: true },
    orderBy: { _count: { comparisonId: "desc" } },
    take: 5,
  });

  const mostActiveDetails = await Promise.all(
    mostActive.map(async (m) => {
      const comp = await prisma.grantComparison.findUnique({
        where: { id: m.comparisonId },
      });
      return {
        id: m.comparisonId,
        name: comp?.name ?? "Untitled",
        count: m._count.comparisonId,
      };
    })
  );

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-semibold">Comparison Analytics</h1>

      {/* TOP METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Comparisons" value={totalComparisons} />
        <MetricCard title="Total Comments" value={totalComments} />
        <MetricCard title="Total Activities" value={totalActivities} />
      </div>

      {/* GRANT METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard title="Total Grants Compared" value={totalGrantsCompared} />
        <MetricCard
          title="Avg Grants per Comparison"
          value={avgGrantsPerComparison}
        />
      </div>

      {/* MOST ACTIVE COMPARISONS */}
      <div className="p-4 border rounded bg-white shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Most Active Comparisons</h2>

        {mostActiveDetails.length === 0 && (
          <p className="text-sm text-gray-600">No activity yet.</p>
        )}

        <ul className="space-y-2">
          {mostActiveDetails.map((item) => (
            <li
              key={item.id}
              className="p-3 border rounded bg-gray-50 flex justify-between"
            >
              <span>{item.name}</span>
              <span className="font-semibold">{item.count} actions</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="p-4 border rounded bg-white shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

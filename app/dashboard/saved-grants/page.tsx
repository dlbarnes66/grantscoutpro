import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function SavedGrantsPage() {
  const hasSaved = false;

  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Saved Grants" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Saved Grants</h1>

      {!hasSaved ? (
        <EmptyState
          title="No Saved Grants"
          description="You haven’t saved any grants yet."
          actionLabel="Search Grants"
          onAction={() => {}}
        />
      ) : (
        <Card>
          <p className="text-slate-300">Saved grants will appear here.</p>
        </Card>
      )}
    </div>
  );
}

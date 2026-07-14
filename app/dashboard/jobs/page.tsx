import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function DashboardJobsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Jobs" }]} />

      <h1 className="text-3xl font-bold text-white mb-6">Jobs</h1>

      <Card>
        <p className="text-slate-300">
          Your job postings, applications, or grant-related tasks will appear here.
        </p>
      </Card>
    </div>
  );
}

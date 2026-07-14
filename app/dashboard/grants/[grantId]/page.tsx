import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export default function GrantDetailsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Grants", href: "/dashboard/grants" },
          { label: "Grant Details" },
        ]}
      />

      <h1 className="text-3xl font-bold text-white mb-4">
        Grant Title Goes Here
      </h1>

      <Tabs
        tabs={[
          {
            label: "Overview",
            content: (
              <Card>
                <p className="text-slate-300">
                  Full description of the grant opportunity goes here.
                </p>
              </Card>
            ),
          },
          {
            label: "Eligibility",
            content: (
              <Card>
                <p className="text-slate-300">
                  Eligibility details go here.
                </p>
              </Card>
            ),
          },
          {
            label: "Funding",
            content: (
              <Card>
                <p className="text-slate-300">
                  Funding details go here.
                </p>
              </Card>
            ),
          },
        ]}
      />

      <div className="flex gap-4 mt-8">
        <Button variant="primary">Write Proposal with AI</Button>
        <Button variant="secondary">Save Grant</Button>
      </div>
    </div>
  );
}

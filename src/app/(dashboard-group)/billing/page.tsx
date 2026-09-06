import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function BillingPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="p-10 text-white">
        Unauthorized
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      planName: true,
      status: true,
      renewalDate: true,
      stripeCustomerId: true,
    },
  });

  const plan = user?.planName ?? "basic";
  const status = user?.status ?? "inactive";

  const renewal = user?.renewalDate
    ? new Date(user.renewalDate).toLocaleDateString()
    : "N/A";

  return (
    <DashboardShell>
      <div className="space-y-10">
        <h1 className="text-3xl font-bold">
          Billing
        </h1>

        <div className="p-6 bg-[#11233F] rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">
            Current Plan
          </h2>

          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">
              Plan:
            </span>{" "}
            {plan}
          </p>

          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">
              Status:
            </span>{" "}
            {status}
          </p>

          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">
              Next Renewal:
            </span>{" "}
            {renewal}
          </p>

          <p className="text-gray-300">
            <span className="font-semibold text-white">
              Stripe Customer ID:
            </span>{" "}
            {user?.stripeCustomerId ?? "None"}
          </p>
        </div>

        <div className="p-6 bg-[#11233F] rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">
            Upgrade Your Plan
          </h2>

          <p className="text-gray-300">
            Available Plans:
            Basic, Team, Business, Enterprise
          </p>
        </div>

        <div className="p-6 bg-[#11233F] rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">
            Manage Subscription
          </h2>

          <p className="text-gray-300">
            Billing portal integration enabled.
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
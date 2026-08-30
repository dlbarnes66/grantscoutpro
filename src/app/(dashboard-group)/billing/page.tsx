import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";

export default async function BillingPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div className="p-10 text-white">Unauthorized</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planName: true,
      status: true,
      renewalDate: true,
      stripeCustomerId: true,
    },
  });

  const plan = user?.planName ?? "free";
  const status = user?.status ?? "inactive";
  const renewal = user?.renewalDate
    ? new Date(user.renewalDate).toLocaleDateString()
    : "N/A";

  return (
    <DashboardShell>
      <div className="space-y-10">

        <h1 className="text-3xl font-bold">Billing</h1>

        {/* CURRENT PLAN */}
        <div className="p-6 bg-[#11233F] rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Current Plan</h2>

          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Plan:</span> {plan}
          </p>

          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Status:</span> {status}
          </p>

          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Next Renewal:</span> {renewal}
          </p>

          <p className="text-gray-300 mb-2">
            <span className="font-semibold text-white">Stripe Customer ID:</span>{" "}
            {user?.stripeCustomerId ?? "None"}
          </p>
        </div>

        {/* UPGRADE BUTTON */}
        <div className="p-6 bg-[#11233F] rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Upgrade Your Plan</h2>

          <p className="text-gray-300 mb-6">
            Upgrade to unlock more AI tools, unlimited workspaces, team collaboration,
            and advanced grant writing features.
          </p>

          <button
            onClick={async () => {
              const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFESSIONAL,
                }),
              });

              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}
            className="px-6 py-3 bg-[#00E5FF] text-black rounded-lg font-semibold"
          >
            Upgrade to Professional
          </button>
        </div>

        {/* BILLING PORTAL */}
        <div className="p-6 bg-[#11233F] rounded-xl">
          <h2 className="text-2xl font-semibold mb-4">Manage Subscription</h2>

          <p className="text-gray-300 mb-6">
            View invoices, update payment methods, or cancel your subscription.
          </p>

          <form action="/api/stripe/portal" method="POST">
            <button
              type="submit"
              className="px-6 py-3 border border-[#00E5FF] text-[#00E5FF] rounded-lg font-semibold"
            >
              Open Billing Portal
            </button>
          </form>
        </div>

      </div>
    </DashboardShell>
  );
}

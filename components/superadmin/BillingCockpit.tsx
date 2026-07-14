"use client";

import { useEffect, useState } from "react";

export default function BillingCockpit() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/superadmin/billing");
      const json = await res.json();
      setData(json);
    }
    load();
  }, []);

  async function run(action, payload) {
    const res = await fetch("/api/superadmin/billing", {
      method: "POST",
      body: JSON.stringify({ action, payload }),
    });

    const json = await res.json();
    setMessage(JSON.stringify(json, null, 2));
  }

  if (!data) return <div>Loading billing cockpit…</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Billing Cockpit</h1>

      <section className="p-4 border rounded bg-white shadow space-y-4">
        {data.map((entry) => (
          <div key={entry.user.id} className="p-4 border rounded bg-gray-50 space-y-2">
            <div className="font-bold">{entry.user.email}</div>
            <div className="text-sm text-gray-600">
              Plan: {entry.user.planName ?? "none"}  
              Status: {entry.user.status ?? "none"}  
              Renewal: {entry.user.renewalDate ?? "none"}
            </div>

            {entry.subscriptions.map((sub) => (
              <div key={sub.id} className="p-3 border rounded bg-white">
                <div className="font-semibold">Subscription: {sub.id}</div>
                <div className="text-sm text-gray-600">
                  Status: {sub.status}  
                  Trial ends: {sub.trial_end ? new Date(sub.trial_end * 1000).toLocaleString() : "none"}
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() =>
                      run("cancelSubscription", { subscriptionId: sub.id })
                    }
                    className="px-3 py-2 bg-red-600 text-white rounded"
                  >
                    Cancel at Period End
                  </button>

                  <button
                    onClick={() =>
                      run("extendTrial", {
                        subscriptionId: sub.id,
                        newTrialEnd: Math.floor(
                          new Date(prompt("New trial end date (YYYY-MM-DD)?")).getTime() / 1000
                        ),
                      })
                    }
                    className="px-3 py-2 bg-blue-600 text-white rounded"
                  >
                    Extend Trial
                  </button>

                  <button
                    onClick={() =>
                      run("applyCredit", {
                        customerId: entry.user.stripeCustomerId,
                        amount: Number(prompt("Credit amount in cents?")),
                        description: prompt("Credit description?"),
                      })
                    }
                    className="px-3 py-2 bg-green-600 text-white rounded"
                  >
                    Apply Credit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </section>

      {message && (
        <pre className="p-4 bg-white border rounded shadow text-sm overflow-auto">
          {message}
        </pre>
      )}
    </div>
  );
}

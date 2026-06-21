"use client";

import { useEffect, useState } from "react";

export default function SavedGrantsPage() {
  const [grants, setGrants] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchSaved() {
    const res = await fetch("/api/saved-grants", {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      setGrants(data.saved || []);
    }

    setLoading(false);
  }

  async function removeGrant(id) {
    await fetch(`/api/saved-grants/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    fetchSaved();
  }

  useEffect(() => {
    fetchSaved();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Loading saved grants…
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-6">Saved Grants</h1>

        {grants.length === 0 ? (
          <p className="text-gray-600">You haven’t saved any grants yet.</p>
        ) : (
          <div className="space-y-4">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{grant.title}</h3>
                    {grant.agency && (
                      <p className="text-gray-600">{grant.agency}</p>
                    )}

                    {grant.url && (
                      <a
                        href={grant.url}
                        target="_blank"
                        className="text-blue-600 underline text-sm"
                      >
                        View Grant
                      </a>
                    )}

                    <p className="text-xs text-gray-500 mt-2">
                      Saved on {new Date(grant.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <button
                    onClick={() => removeGrant(grant.id)}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

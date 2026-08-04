"use client";

import { useState } from "react";
import Badge from "@/components/ui/Badge";     // ⭐ FIXED
import Button from "@/components/ui/Button";   // ⭐ FIXED
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Grant {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  amount: string;
}

interface CompareTableProps {
  grants: Grant[];
  onRemove: (id: string) => void;
}

export default function CompareTable({ grants, onRemove }: CompareTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    setLoadingId(id);
    await onRemove(id);
    setLoadingId(null);
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Comparison Table</h2>

      {grants.length === 0 && (
        <p className="text-sm text-gray-500">No grants selected for comparison.</p>
      )}

      {grants.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Title</th>
              <th className="text-left py-2">Agency</th>
              <th className="text-left py-2">Deadline</th>
              <th className="text-left py-2">Amount</th>
              <th className="text-left py-2"></th>
            </tr>
          </thead>

          <tbody>
            {grants.map((grant) => (
              <tr key={grant.id} className="border-b">
                <td className="py-2 font-medium">{grant.title}</td>
                <td className="py-2">
                  <Badge>{grant.agency}</Badge>
                </td>
                <td className="py-2">{grant.deadline}</td>
                <td className="py-2">{grant.amount}</td>
                <td className="py-2 text-right">
                  <Button
                    variant="ghost"
                    className="px-2 py-1"
                    disabled={loadingId === grant.id}
                    onClick={() => handleRemove(grant.id)}
                  >
                    {loadingId === grant.id ? (
                      "Removing…"
                    ) : (
                      <XMarkIcon className="h-4 w-4" />
                    )}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

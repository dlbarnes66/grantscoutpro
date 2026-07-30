import { GrantCard } from "./GrantCard";

export function GrantList({ grants }: { grants: any[] }) {
  if (grants.length === 0) {
    return <p className="p-4 text-gray-500">No grants found.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      {grants.map((grant) => (
        <GrantCard key={grant.id} grant={grant} />
      ))}
    </div>
  );
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const colors = {
    paid: "text-green-400",
    open: "text-yellow-400",
    uncollectible: "text-red-400",
    void: "text-slate-500"
  };

  return (
    <span className={`font-semibold ${colors[status] || "text-slate-400"}`}>
      {status.toUpperCase()}
    </span>
  );
}

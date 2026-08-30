export function PaymentStatusBadge({
  status
}: {
  status: "paid" | "open" | "uncollectible" | "void";
}) {
  const colors: Record<typeof status, string> = {
    paid: "text-green-400",
    open: "text-yellow-400",
    uncollectible: "text-red-400",
    void: "text-slate-500"
  };

  return (
    <span className={`font-semibold ${colors[status]}`}>
      {status.toUpperCase()}
    </span>
  );
}

export function SeverityBadge({
  level
}: {
  level: "info" | "warning" | "system";
}) {
  const colors: Record<typeof level, string> = {
    info: "text-blue-400",
    warning: "text-yellow-400",
    system: "text-purple-400"
  };

  return (
    <span className={`font-semibold ${colors[level]}`}>
      {level.toUpperCase()}
    </span>
  );
}

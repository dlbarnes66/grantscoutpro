export function SeverityBadge({ level }: { level: string }) {
  const colors = {
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

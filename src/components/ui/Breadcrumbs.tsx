import Link from "next/link";

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <div className="flex gap-2 text-gray-400 mb-6">
      {items.map((item, idx) => (
        <span key={idx}>
          {item.href ? (
            <Link href={item.href} className="hover:text-[#00E5FF]">
              {item.label}
            </Link>
          ) : (
            <span className="text-white">{item.label}</span>
          )}

          {idx < items.length - 1 && <span> / </span>}
        </span>
      ))}
    </div>
  );
}

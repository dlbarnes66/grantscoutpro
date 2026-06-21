"use client";

export default function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white shadow-sm border rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && (
        <p className="text-gray-600 text-sm mt-1">{description}</p>
      )}
      <div className="mt-4 space-y-4">{children}</div>
    </div>
  );
}

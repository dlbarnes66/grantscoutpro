import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

export default function Loading() {
  return (
    <div className="p-6">
      <LoadingSkeleton lines={8} />
    </div>
  );
}

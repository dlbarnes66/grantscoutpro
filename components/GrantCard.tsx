"use client";

import Link from "next/link";
import { Card, CardHeader, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BookmarkIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

interface GrantCardProps {
  id: string;
  title: string;
  agency: string;
  deadline: string;
  amount: string;
  bookmarked?: boolean;
  onBookmark?: (id: string) => void;
  onCompare?: (id: string) => void;
}

export default function GrantCard({
  id,
  title,
  agency,
  deadline,
  amount,
  bookmarked = false,
  onBookmark,
  onCompare,
}: GrantCardProps) {
  const handleBookmark = () => {
    if (onBookmark) onBookmark(id);
  };

  const handleCompare = () => {
    if (onCompare) onCompare(id);
  };

  return (
    <Card className="p-4 border rounded-lg bg-white shadow-sm">
      <CardHeader>
        <Link href={`/dashboard/grants/${id}`}>
          <h3 className="text-lg font-semibold hover:underline">{title}</h3>
        </Link>

        <div className="mt-2">
          <Badge>{agency}</Badge>
        </div>
      </CardHeader>

      <div className="mt-3 text-sm text-gray-600 space-y-1">
        <p>
          <span className="font-medium">Deadline:</span> {deadline}
        </p>
        <p>
          <span className="font-medium">Amount:</span> {amount}
        </p>
      </div>

      <CardFooter className="mt-4 flex items-center justify-between">
        <Button
          variant="secondary"
          className="flex items-center gap-2 px-3 py-1 text-sm"
          onClick={handleCompare}
        >
          <Squares2X2Icon className="h-4 w-4" />
          Compare
        </Button>

        <Button
          variant={bookmarked ? "primary" : "ghost"}
          className="flex items-center gap-2 px-3 py-1 text-sm"
          onClick={handleBookmark}
        >
          <BookmarkIcon className="h-4 w-4" />
          {bookmarked ? "Saved" : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
